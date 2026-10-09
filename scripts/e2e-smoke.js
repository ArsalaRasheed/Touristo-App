/*
|--------------------------------------------------------------------------
| Touristo E2E smoke check (read-only)
|--------------------------------------------------------------------------
| Credentials come ONLY from environment variables. Nothing is written to
| the repository and secrets are never printed to the console.
|
| Required:
|   E2E_TRAVELER_EMAIL
|   E2E_TRAVELER_PASSWORD
| Optional:
|   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD   (admin moderation endpoints)
|   E2E_BASE_URL                           (default http://localhost:3000)
|
| Run:  E2E_TRAVELER_EMAIL=... E2E_TRAVELER_PASSWORD=... npm run test:e2e
| Exit: 0 = passed, 1 = failed, 2 = skipped (missing configuration)
*/

const path = require('path');

// Same convention as index.js: load the local .env (values are never printed).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const REQUIRED_VARS = ['E2E_TRAVELER_EMAIL', 'E2E_TRAVELER_PASSWORD'];

const missing = REQUIRED_VARS.filter(name => !process.env[name]);

if (missing.length) {
  console.log('[e2e] SKIPPED - missing environment configuration.');
  console.log('[e2e] Provide these variables (do NOT put them in the repo):');
  missing.forEach(name => console.log(`[e2e]   ${name}`));
  console.log('[e2e] Optional admin variables: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD');
  console.log('[e2e] Optional server URL:       E2E_BASE_URL');
  process.exit(2);
}

const results = [];

const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`[${ok ? 'ok' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
};

const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `login failed with HTTP ${response.status}`);
  }

  if (!body?.token) {
    throw new Error('login response did not include a token');
  }

  return body.token;
};

const get = async (path, token) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const body = await response.json().catch(() => null);

  return { status: response.status, body };
};

const run = async () => {
  console.log(`[e2e] base url: ${BASE_URL}`);

  // 1. Traveler login
  let travelerToken;

  try {
    travelerToken = await login(
      process.env.E2E_TRAVELER_EMAIL,
      process.env.E2E_TRAVELER_PASSWORD
    );
    record('traveler login', true);
  } catch (err) {
    record('traveler login', false, err.message);
    finish();
    return;
  }

  // 2. Traveler - own reports
  try {
    const { status, body } = await get('/api/reports/mine?page=1&limit=5', travelerToken);
    const ok = status === 200 && body?.status === 'success' && Array.isArray(body?.data?.reports);
    record('GET /api/reports/mine', ok, `HTTP ${status}`);
  } catch (err) {
    record('GET /api/reports/mine', false, err.message);
  }

  // 3. Traveler - inbox (auth round trip, read only)
  try {
    const { status, body } = await get('/api/messages/inbox', travelerToken);
    const ok = status === 200 && body?.success !== false;
    record('GET /api/messages/inbox', ok, `HTTP ${status}`);
  } catch (err) {
    record('GET /api/messages/inbox', false, err.message);
  }

  // 4. Unauthenticated reports endpoint must be rejected
  try {
    const { status } = await get('/api/reports/mine', undefined);
    record('GET /api/reports/mine without token is rejected', status === 401 || status === 403, `HTTP ${status}`);
  } catch (err) {
    record('GET /api/reports/mine without token is rejected', false, err.message);
  }

  // 5. Optional admin checks
  const hasAdmin = process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD;

  if (hasAdmin) {
    let adminToken;

    try {
      adminToken = await login(process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD);
      record('admin login', true);
    } catch (err) {
      record('admin login', false, err.message);
    }

    if (adminToken) {
      try {
        const { status, body } = await get('/api/admin/reports?page=1&limit=5', adminToken);
        const ok = status === 200 && body?.status === 'success';
        record('GET /api/admin/reports', ok, `HTTP ${status}`);
      } catch (err) {
        record('GET /api/admin/reports', false, err.message);
      }
    }
  } else {
    console.log('[e2e] admin variables not set - skipping admin moderation checks');
  }

  finish();
};

const finish = () => {
  const failed = results.filter(item => !item.ok);

  console.log(`[e2e] ${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length) {
    failed.forEach(item => console.log(`[e2e] failed: ${item.name} (${item.detail})`));
    process.exitCode = 1;
  }
};

run().catch(err => {
  console.error('[e2e] unexpected error:', err.message);
  process.exitCode = 1;
});
