/*
|--------------------------------------------------------------------------
| AI service - provider abstraction with bounded retry + fallback
|--------------------------------------------------------------------------
|
| Architecture:
|
|   aiService.generateText / generateJson
|   ├── Gemini provider   (@google/generative-ai, server-side GEMINI_API_KEY)
|   ├── OpenAI provider   (openai SDK, server-side OPENAI_API_KEY)
|   ├── per-attempt timeout
|   ├── bounded retries on the primary provider
|   ├── bounded single fallback to the secondary provider
|   ├── structured output validation (generateJson)
|   └) safe, typed errors (never leaks keys, prompts or stack traces)
|
| Rules:
| - Provider order: AI_PRIMARY_PROVIDER when it is configured, otherwise
|   Gemini first (the original provider) then OpenAI.
| - Retries/fallback only for temporary provider problems
|   (rate limit, 5xx, timeout, transport, provider-side 400/404).
| - Never retried / never fallen back: app-level validation errors are
|   rejected by callers before reaching this module, and provider
|   authentication failures (401/403) are treated as configuration faults.
| - Malformed model output becomes AIError('invalid_output') so the caller
|   can answer deliberately (422) instead of burning another AI call.
| - Logs carry provider/code/status/latency only - never the API key and
|   never the prompt contents.
|
|--------------------------------------------------------------------------
*/

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');


const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_OVERALL_TIMEOUT_MS = 30000;
const DEFAULT_PRIMARY_ATTEMPTS = 2;


/*
|--------------------------------------------------------------------------
| Typed, user-safe errors
|--------------------------------------------------------------------------
*/

const ERROR_STATUS = {
  not_configured: 503,
  provider_auth: 503,
  rate_limited: 429,
  unavailable: 503,
  timeout: 504,
  invalid_request: 400,
  invalid_output: 422,
  unknown: 503
};


const ERROR_MESSAGE = {
  not_configured:
    'The AI service is not configured. Please try again later.',
  provider_auth:
    'The AI service is temporarily unavailable. Please try again later.',
  rate_limited:
    'The AI service is temporarily busy. Please wait a moment and try again.',
  unavailable:
    'The AI service is temporarily unavailable. Please try again in a moment.',
  timeout:
    'The AI service took too long to respond. Please try again.',
  invalid_request:
    'The request could not be processed. Please check your input and try again.',
  invalid_output:
    'The AI returned an incomplete response. Please try again.',
  unknown:
    'The AI service is temporarily unavailable. Please try again in a moment.'
};


class AIError extends Error {
  constructor(code, options = {}) {
    const safeCode = ERROR_STATUS[code] ? code : 'unknown';

    super(options.message || ERROR_MESSAGE[safeCode]);

    this.name = 'AIError';
    this.code = safeCode;
    this.status = ERROR_STATUS[safeCode];
    this.provider = options.provider || null;
    this.retryable = RETRYABLE_CODES.has(safeCode);

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}


const RETRYABLE_CODES = new Set([
  'rate_limited',
  'unavailable',
  'timeout'
]);


/*
| Temporary provider problems where switching provider can still
| answer the same request. Provider auth faults are excluded on
| purpose - they are configuration problems, not availability ones.
*/
const FALLBACKABLE_CODES = new Set([
  'rate_limited',
  'unavailable',
  'timeout',
  'invalid_request',
  'unknown'
]);


/*
|--------------------------------------------------------------------------
| Error classification
|--------------------------------------------------------------------------
*/

const getProviderStatus = error => {
  if (!error) return null;

  const candidates = [
    error.status,
    error.statusCode,
    error.response?.status,
    error.error?.status,
    Array.isArray(error.errorDetails)
      ? error.errorDetails[0]?.status
      : null
  ];

  for (const candidate of candidates) {
    const parsed = Number(candidate);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};


const classifyProviderError = error => {
  if (error instanceof AIError) {
    return error.code;
  }

  const status = getProviderStatus(error);
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || error?.error?.code || '');


  if (
    status === 401 ||
    status === 403 ||
    message.includes('api key not valid') ||
    message.includes('incorrect api key') ||
    message.includes('invalid api key') ||
    message.includes('unauthorized')
  ) {
    return 'provider_auth';
  }


  if (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('resource exhausted') ||
    message.includes('resource_exhausted') ||
    message.includes('too many requests') ||
    message.includes('quota') ||
    message.includes('overloaded')
  ) {
    return 'rate_limited';
  }


  if (
    status === 408 ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    message.includes('deadline exceeded')
  ) {
    return 'timeout';
  }


  if (
    status === 400 ||
    status === 404 ||
    status === 413 ||
    message.includes('invalid argument') ||
    message.includes('unsupported') ||
    message.includes('not found')
  ) {
    return 'invalid_request';
  }


  if (
    (status !== null && status >= 500) ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('internal error') ||
    message.includes('fetch failed') ||
    ['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'EPIPE'].includes(code)
  ) {
    return 'unavailable';
  }


  if (status !== null) {
    return 'unknown';
  }


  /*
   * No HTTP status at all - most likely a transport level failure.
   */
  return 'unavailable';
};


const toAIError = (error, provider) => {
  if (error instanceof AIError) {
    if (!error.provider && provider) {
      error.provider = provider;
    }

    return error;
  }

  const code = classifyProviderError(error);

  return new AIError(code, { provider, cause: error });
};


/*
|--------------------------------------------------------------------------
| Utilities
|--------------------------------------------------------------------------
*/

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));


const getBackoffDelay = attempt =>
  Math.min(500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250), 4000);


const withTimeout = (value, timeoutMs) => {
  let timer = null;

  /*
   * Providers may legitimately return a plain value (a sync stub or an
   * empty string). Normalising first guarantees `catch` exists, so the
   * timer below is always registered AND always cleared by `finally`.
   * A non-promise value used to throw here after the timer was created,
   * leaking a live timeout that later rejected with nobody listening.
   */
  const promise = Promise.resolve(value);

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new AIError('timeout'));
    }, timeoutMs);
  });

  /*
   * If the timeout wins the race the provider promise keeps running;
   * swallow its eventual rejection so it never becomes an unhandled
   * rejection.
   */
  promise.catch(() => {});

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};


const stripCodeFences = text =>
  String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();


/*
 * Strict JSON parse, then outer-object-span extraction for models that
 * wrapped the JSON in prose anyway. Returns null when nothing usable
 * is present - the caller decides how to answer.
 */
const parseJsonText = text => {
  const cleaned = stripCodeFences(text);

  if (!cleaned) {
    return null;
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    /* fall through to span extraction */
  }

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return null;
};


/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Each provider: async (options) => string
| options: { prompt, json, temperature, maxOutputTokens, timeoutMs }
|
*/

const geminiProvider = async ({
  prompt,
  json,
  temperature,
  maxOutputTokens,
  timeoutMs
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AIError('not_configured', { provider: 'gemini' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash'
  });

  const generationConfig = {};

  if (json) {
    generationConfig.responseMimeType = 'application/json';
  }

  if (typeof temperature === 'number') {
    generationConfig.temperature = temperature;
  }

  if (maxOutputTokens) {
    generationConfig.maxOutputTokens = maxOutputTokens;
  }

  const request = model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig
  });

  const result = await request;
  const response = await result.response;

  return response.text();
};


const openaiProvider = async ({
  prompt,
  json,
  temperature,
  maxOutputTokens,
  timeoutMs
}) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIError('not_configured', { provider: 'openai' });
  }

  const client = new OpenAI({
    apiKey,
    /*
     * Retries are handled by this module so that fallback stays bounded
     * and predictable - the SDK must not add its own retry loop.
     */
    maxRetries: 0
  });

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  /*
   * Reasoning models reject `temperature` and expect
   * `max_completion_tokens`; classic chat models accept
   * `temperature` + `max_tokens`.
   */
  const isReasoningModel = /^(o[1-9]|gpt-[5-9])/.test(model);

  const params = {
    model,
    messages: [{ role: 'user', content: prompt }]
  };

  if (json) {
    params.response_format = { type: 'json_object' };
  }

  if (maxOutputTokens) {
    if (isReasoningModel) {
      params.max_completion_tokens = maxOutputTokens;
    } else {
      params.max_tokens = maxOutputTokens;
    }
  }

  if (!isReasoningModel && typeof temperature === 'number') {
    params.temperature = temperature;
  }

  const completion = await client.chat.completions.create(
    params,
    { timeout: timeoutMs }
  );

  return completion?.choices?.[0]?.message?.content ?? '';
};


const DEFAULT_PROVIDERS = {
  gemini: geminiProvider,
  openai: openaiProvider
};


/*
|--------------------------------------------------------------------------
| Provider order
|--------------------------------------------------------------------------
*/

const configuredProviderNames = () => {
  const configured = [];

  if (process.env.GEMINI_API_KEY) configured.push('gemini');
  if (process.env.OPENAI_API_KEY) configured.push('openai');

  return configured;
};


const resolveProviderOrder = () => {
  const configured = configuredProviderNames();
  const preferred = String(process.env.AI_PRIMARY_PROVIDER || '')
    .trim()
    .toLowerCase();

  if (preferred && configured.includes(preferred)) {
    return [
      preferred,
      ...configured.filter(name => name !== preferred)
    ];
  }

  return configured;
};


const isAiConfigured = () => resolveProviderOrder().length > 0;


/*
|--------------------------------------------------------------------------
| Core
|--------------------------------------------------------------------------
*/

const createAiService = (options = {}) => {
  const providers = options.providers || DEFAULT_PROVIDERS;
  const resolveOrder =
    options.resolveOrder || resolveProviderOrder;


  const generateText = async (request = {}) => {
    const {
      prompt,
      temperature,
      maxOutputTokens,
      json = false,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      overallTimeoutMs = DEFAULT_OVERALL_TIMEOUT_MS,
      primaryAttempts = DEFAULT_PRIMARY_ATTEMPTS
    } = request;


    if (typeof prompt !== 'string' || !prompt.trim()) {
      throw new AIError('invalid_request');
    }


    const order = resolveOrder();

    if (!order.length) {
      throw new AIError('not_configured');
    }


    const startedAt = Date.now();
    let lastError = null;


    for (
      let providerIndex = 0;
      providerIndex < order.length;
      providerIndex++
    ) {
      const providerName = order[providerIndex];
      const provider = providers[providerName];

      if (typeof provider !== 'function') {
        continue;
      }

      const maxAttempts =
        providerIndex === 0
          ? Math.max(1, Math.min(primaryAttempts, 3))
          : 1;


      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (Date.now() - startedAt >= overallTimeoutMs) {
          /*
           * The request exceeded its overall budget - no more attempts
           * or fallbacks may be started. Report it as a timeout.
           */
          lastError = new AIError('timeout', {
            provider: providerName
          });
          break;
        }

        const attemptStartedAt = Date.now();

        try {
          const text = await withTimeout(
            provider({
              prompt,
              json,
              temperature,
              maxOutputTokens,
              timeoutMs
            }),
            timeoutMs
          );

          if (typeof text !== 'string' || !text.trim()) {
            /*
             * Empty provider output is a transient provider problem,
             * not a user error - treat it like a 5xx so the fallback
             * path can still answer.
             */
            throw new AIError('unavailable', { provider: providerName });
          }

          return {
            text,
            provider: providerName,
            latencyMs: Date.now() - attemptStartedAt
          };
        } catch (error) {
          const code = classifyProviderError(error);

          lastError = error;

          console.warn(
            `[ai] provider=${providerName} code=${code} status=${getProviderStatus(error) ?? '-'} attempt=${attempt + 1}/${maxAttempts} latency=${Date.now() - attemptStartedAt}ms`
          );

          const hasMoreAttempts = attempt < maxAttempts - 1;

          if (RETRYABLE_CODES.has(code) && hasMoreAttempts) {
            await sleep(getBackoffDelay(attempt));
            continue;
          }

          if (FALLBACKABLE_CODES.has(code) && providerIndex < order.length - 1) {
            /*
             * Move to the fallback provider - no further retries on the
             * failing provider, so one request can never spiral.
             */
            break;
          }

          throw toAIError(error, providerName);
        }
      }
    }


    throw toAIError(lastError, lastError?.provider);
  };


  const generateJson = async (request = {}) => {
    const result = await generateText({ ...request, json: true });
    const parsed = parseJsonText(result.text);

    if (parsed === null || typeof parsed !== 'object') {
      console.warn(
        `[ai] provider=${result.provider} code=invalid_output reason=unparseable_json`
      );

      throw new AIError('invalid_output', {
        provider: result.provider
      });
    }

    return {
      data: parsed,
      provider: result.provider,
      latencyMs: result.latencyMs
    };
  };


  return { generateText, generateJson };
};


const defaultService = createAiService();


module.exports = {
  createAiService,
  generateText: (...args) => defaultService.generateText(...args),
  generateJson: (...args) => defaultService.generateJson(...args),
  isAiConfigured,
  getProviderOrder: resolveProviderOrder,
  classifyProviderError,
  parseJsonText,
  AIError
};
