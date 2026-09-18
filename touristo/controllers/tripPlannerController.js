const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const sleep = (ms) =>
  new Promise(resolve =>
    setTimeout(resolve, ms)
  );

const getErrorStatus = (error) => {
  return (
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.errorDetails?.status ||
    null
  );
};

const isRetryableError = (error) => {
  const status = getErrorStatus(error);

  if (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message = String(
    error?.message || ''
  ).toLowerCase();

  return (
    message.includes('rate limit') ||
    message.includes('resource exhausted') ||
    message.includes('too many requests') ||
    message.includes('service unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('timeout') ||
    message.includes('deadline exceeded')
  );
};

const getRetryDelay = (error, attempt) => {
  const retryAfter =
    error?.response?.headers?.['retry-after'] ||
    error?.response?.headers?.['Retry-After'];

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (
      Number.isFinite(seconds) &&
      seconds > 0
    ) {
      return Math.min(seconds * 1000, 30000);
    }
  }

  const baseDelay =
    Math.pow(2, attempt) * 1000;

  const jitter =
    Math.floor(Math.random() * 500);

  return Math.min(
    baseDelay + jitter,
    15000
  );
};

const generateWithRetry = async (
  model,
  prompt,
  maxAttempts = 4
) => {
  let lastError;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    try {
      return await model.generateContent(
        prompt
      );
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini request failed (attempt ${
          attempt + 1
        }/${maxAttempts}):`,
        {
          status: getErrorStatus(error),
          message: error?.message
        }
      );

      const hasMoreAttempts =
        attempt < maxAttempts - 1;

      if (
        !hasMoreAttempts ||
        !isRetryableError(error)
      ) {
        throw error;
      }

      const delay =
        getRetryDelay(
          error,
          attempt
        );

      console.log(
        `Retrying Gemini request in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};

const planTrip = async (req, res) => {
  try {
    const { message, userId } =
      req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message:
          'AI service is not configured'
      });
    }

    /*
     * Keep the existing Gemini model used by the project.
     * The retry layer handles temporary 429/5xx failures.
     */
    const model =
      genAI.getGenerativeModel({
        model: 'gemini-3.5-flash'
      });

    const prompt = `
      You are a helpful travel assistant for Touristo,
      a platform that connects travelers with verified
      tour operators in Pakistan.

      Your task is to help users plan trips based on
      their preferences.

      Always respond in the same language/script
      the user used:
      - English
      - Urdu script
      - Roman Urdu

      User request:
      "${String(message).trim()}"

      Provide a concise, friendly response with
      helpful travel advice.

      Structure your response clearly with:

      1. Acknowledgment of their request
      2. Key recommendations or information
      3. Follow-up questions if needed

      Use **bold** formatting for important keywords,
      destinations, or recommendations.

      Keep your response under 3-4 sentences
      whenever possible.
    `;

    const result =
      await generateWithRetry(
        model,
        prompt,
        4
      );

    const response =
      await result.response;

    const text =
      response.text();

    return res.status(200).json({
      status: 'success',
      message: text,
      recommendedPackages: []
    });

  } catch (error) {
    console.error(
      'Error in planTrip:',
      error
    );

    const status =
      getErrorStatus(error);

    if (status === 429) {
      return res.status(429).json({
        status: 'error',
        message:
          'The AI service is temporarily busy. Please wait a moment and try again.'
      });
    }

    if (
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504
    ) {
      return res.status(503).json({
        status: 'error',
        message:
          'The AI service is temporarily unavailable. Please try again in a moment.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message:
        'Failed to process trip planning request',
      error: error.message
    });
  }
};

module.exports = {
  planTrip
};