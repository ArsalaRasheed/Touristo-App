/*
|--------------------------------------------------------------------------
| AI provider unit tests (no real API keys, no network)
|--------------------------------------------------------------------------
|
| Run:  node scripts/ai-provider-tests.js
|
| Verifies the bounded retry / fallback behavior of aiService using
| stubbed providers. Environment variables are NOT read for anything
| beyond the provider order resolver, which is injected too.
|--------------------------------------------------------------------------
*/

const assert = require('assert');

const {
  createAiService,
  parseJsonText,
  AIError
} = require('../touristo/services/aiService');


const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));


let passed = 0;
let failed = 0;

const failures = [];


const test = (name, fn) =>
  Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`PASS: ${name}`);
    })
    .catch(error => {
      failed += 1;
      failures.push({ name, error });
      console.error(`FAIL: ${name}: ${error.message}`);
    });


/*
 * Build a service with stubbed providers and a fixed order.
 */
const buildService = (providerFns, order) =>
  createAiService({
    providers: {
      primary: providerFns.primary,
      secondary: providerFns.secondary ||
        (async () => '@@SECONDARY_RESULT@@')
    },
    resolveOrder: () =>
      ['primary', 'secondary'].filter(
        name => providerFns[name] || name === 'secondary'
      ).slice(0, order || 2)
  });


const recorded = () => {
  const log = [];

  const recorder = name =>
    async (options) => {
      log.push(name);

      if (options.testMode === 'failOnce') {
        const err = new Error('temporary failure');
        err.status = 500;
        options.testMode = null;
        throw err;
      }

      if (options.testMode === 'rateLimit') {
        throw new Error('Rate limit exceeded');
      }

      if (options.testMode === 'auth') {
        const err = new Error('Invalid API key');
        err.status = 403;
        throw err;
      }

      if (options.testMode === 'invalidArg') {
        const err = new Error('Model not found');
        err.status = 404;
        throw err;
      }

      if (options.testMode === 'hang') {
        return new Promise(() => {});
      }

      if (options.testMode === 'empty') {
        return '';
      }

      if (options.testMode === 'fences') {
        return '```json\n{"hello":"world"}\n```';
      }

      if (options.testMode === 'garbage') {
        return 'not json at all';
      }

      return '@@' + name + '@@';
    };

  return { log, recorder };
};


(async () => {

  await test('throws not_configured when no provider resolves', async () => {
    const service = createAiService({
      providers: {},
      resolveOrder: () => []
    });

    await assert.rejects(
      service.generateText({ prompt: 'hello' }),
      err =>
        err instanceof AIError &&
        err.code === 'not_configured' &&
        err.status === 503
    );
  });


  await test('falls back to secondary when primary returns 500', async () => {
    const rec = recorded();

    const service = buildService({
      primary: async () => {
        rec.log.push('primary');
        throw Object.assign(new Error('boom'), { status: 500 });
      },
      secondary: rec.recorder('secondary')
    });

    const result = await service.generateText({
      prompt: 'hello',
      testMode: 'x'
    });

    assert.strictEqual(result.text, '@@secondary@@');
    assert.strictEqual(result.provider, 'secondary');
    /*
     * 5xx is retryable AND fallbackable - the primary is retried
     * the bounded number of times before switching providers.
     */
    assert.deepStrictEqual(rec.log, ['primary', 'primary', 'secondary']);
  });


  await test('retries rate_limited once then succeeds on primary (no fallback)', async () => {
    const rec = recorded();

    let attempts = 0;

    const service = buildService({
      primary: async () => {
        rec.log.push('primary');
        attempts += 1;

        if (attempts === 1) {
          throw new Error('Rate limit exceeded');
        }

        return '@@primary@@';
      },
      secondary: rec.recorder('secondary')
    });

    const result = await service.generateText({
      prompt: 'hello'
    });

    assert.strictEqual(result.text, '@@primary@@');
    assert.strictEqual(result.provider, 'primary');
    assert.deepStrictEqual(rec.log, ['primary', 'primary']);
  });


  await test('retries rate_limited twice then falls back when exhausted', async () => {
    const rec = recorded();

    const service = buildService({
      primary: async () => {
        rec.log.push('primary');
        throw new Error('Rate limit exceeded');
      },
      secondary: rec.recorder('secondary')
    });

    const result = await service.generateText({
      prompt: 'hello'
    });

    assert.strictEqual(result.provider, 'secondary');
    assert.ok(rec.log.filter(n => n === 'primary').length >= 2);
    assert.deepStrictEqual(rec.log[rec.log.length - 1], 'secondary');
  });


  await test('provider auth failure never falls back', async () => {
    const rec = recorded();

    const service = buildService({
      primary: () => {
        rec.log.push('primary');
        throw Object.assign(new Error('Invalid API key'), { status: 403 });
      },
      secondary: rec.recorder('secondary')
    });

    await assert.rejects(
      service.generateText({ prompt: 'hello', testMode: 'auth' }),
      err =>
        err instanceof AIError &&
        err.code === 'provider_auth' &&
        err.status === 503
    );

    assert.deepStrictEqual(rec.log, ['primary']);
  });


  await test('invalid argument on primary falls back to secondary', async () => {
    const rec = recorded();

    const service = buildService({
      primary: () => {
        rec.log.push('primary');
        throw Object.assign(new Error('Model not found'), { status: 404 });
      },
      secondary: rec.recorder('secondary')
    });

    const result = await service.generateText({
      prompt: 'hello',
      testMode: 'invalidArg'
    });

    assert.strictEqual(result.provider, 'secondary');
  });


  await test('empty provider output falls back to secondary', async () => {
    const rec = recorded();

    const service = buildService({
      primary: () => {
        rec.log.push('primary');
        return '';
      },
      secondary: rec.recorder('secondary')
    });

    const result = await service.generateText({
      prompt: 'hello',
      testMode: 'empty'
    });

    assert.strictEqual(result.provider, 'secondary');
  });


  await test('empty prompt is an invalid_request', async () => {
    const service = buildService({
      primary: () => Promise.resolve('@@primary@@')
    });

    await assert.rejects(
      service.generateText({ prompt: '   ' }),
      err =>
        err instanceof AIError &&
        err.code === 'invalid_request' &&
        err.status === 400
    );
  });


  await test('per-attempt timeout converts to timeout error', async () => {
    const service = buildService({
      primary: () => new Promise(() => {})
    }, 1);

    await assert.rejects(
      service.generateText({
        prompt: 'hello',
        timeoutMs: 100,
        primaryAttempts: 1
      }),
      err =>
        err instanceof AIError &&
        err.code === 'timeout' &&
        err.status === 504
    );
  });


  await test('overall deadline stops retries', async () => {
    const rec = recorded();

    const failing = async () => {
      rec.log.push('primary');
      throw Object.assign(new Error('busy'), { status: 503 });
    };

    /*
     * Both attempts exceed the overall deadline so they are aborted
     * even though the provider keeps failing (503 = retryable).
     */
    const service = buildService({
      primary: failing
    }, 1);

    await assert.rejects(
      service.generateText({
        prompt: 'hello',
        overallTimeoutMs: 50,
        primaryAttempts: 2
      }),
      err =>
        err instanceof AIError &&
        err.code === 'timeout' &&
        err.status === 504
    );

    assert.ok(rec.log.length <= 2);
  });


  await test('generateJson parses plain JSON', async () => {
    const service = buildService({
      primary: () => Promise.resolve('{"a":1,"b":[true,"x"]}')
    });

    const result = await service.generateJson({ prompt: 'json' });

    assert.deepStrictEqual(result.data, { a: 1, b: [true, 'x'] });
  });


  await test('generateJson parses fenced JSON', async () => {
    const service = buildService({
      primary: () => Promise.resolve('```json\n{"hello":"world"}\n```')
    });

    const result = await service.generateJson({
      prompt: 'json',
      testMode: 'fences'
    });

    assert.deepStrictEqual(result.data, { hello: 'world' });
  });


  await test('generateJson rejects unparseable output as invalid_output', async () => {
    const service = buildService({
      primary: () => Promise.resolve('not json at all')
    });

    await assert.rejects(
      service.generateJson({ prompt: 'json', testMode: 'garbage' }),
      err =>
        err instanceof AIError &&
        err.code === 'invalid_output' &&
        err.status === 422
    );
  });


  await test('parseJsonText extracts outer object span from prose', async () => {
    const parsed = parseJsonText('Here is the result:\n{\n  "x": 5\n}\nThank you.');

    assert.deepStrictEqual(parsed, { x: 5 });
  });


  await test('parseJsonText returns null for empty content', async () => {
    assert.strictEqual(parseJsonText('   '), null);
  });


  if (failed > 0) {
    console.error('\n' + failures.map(f => ` * ${f.name}`).join('\n'));
    console.error(`\n${failed} of ${passed + failed} tests FAILED`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${passed} AI provider tests passed.`);
  }
})();