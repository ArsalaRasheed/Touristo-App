/* Phase 0 security verification probes. Run against a local server. */
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
let pass = 0, fail = 0;

const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};

async function req(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, opts);
    let body = null;
    try { body = await res.json(); } catch { /* non-json */ }
    return { status: res.status, body };
  } catch (err) {
    return { status: 0, body: { message: err.message } };
  }
}

const H = (t) => ({ Authorization: `Bearer ${t}` });
const JSONH = (t) => ({ 'Content-Type': 'application/json', ...H(t) });

const login = async (email, password) => {
  const r = await req('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return r.body;
};

(async () => {
  const traveler = await login(process.env.E2E_TRAVELER_EMAIL, process.env.E2E_TRAVELER_PASSWORD);
  const travelerToken = traveler?.token;
  const travelerId = traveler?.data?.user?.id;
  check('traveler login', !!travelerToken && !!travelerId);

  const adminToken = (await login(process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD))?.token;
  check('admin login', !!adminToken);

  // ---- C2: user endpoints ----
  let r = await req('/api/users/1');
  check('GET /api/users/:id anon -> 401', r.status === 401, `got ${r.status}`);

  r = await req('/api/users/1', { headers: H(travelerToken) });
  const otherId = travelerId === 1 ? 2 : 1;
  r = await req(`/api/users/${otherId}`, { headers: H(travelerToken) });
  check('GET /api/users/:other -> 403', r.status === 403, `got ${r.status}`);

  r = await req(`/api/users/${travelerId}`, { headers: H(travelerToken) });
  const leaksHash = JSON.stringify(r.body || {}).includes('password_hash');
  check('GET self profile -> 200 without password_hash', r.status === 200 && !leaksHash, `status ${r.status} leak=${leaksHash}`);

  r = await req('/api/users', { headers: H(travelerToken) });
  check('GET all users traveler -> 403', r.status === 403, `got ${r.status}`);
  if (adminToken) {
    r = await req('/api/users', { headers: H(adminToken) });
    const adminLeak = JSON.stringify(r.body || {}).includes('password_hash');
    check('GET all users admin -> 200, no hash', r.status === 200 && !adminLeak, `got ${r.status}`);
  }

  // ---- C1: booking endpoints ----
  r = await req('/api/bookings');
  check('GET /api/bookings anon -> 401', r.status === 401, `got ${r.status}`);

  r = await req('/api/bookings/user/1', { headers: H(travelerToken) });
  const u1 = travelerId === 1 ? 2 : 1;
  r = await req(`/api/bookings/user/${u1}`, { headers: H(travelerToken) });
  check('GET bookings of another user -> 403', r.status === 403, `got ${r.status}`);

  r = await req(`/api/bookings/user/${travelerId}`, { headers: H(travelerToken) });
  check('GET own bookings -> 200', r.status === 200, `got ${r.status}`);

  r = await req('/api/bookings/host/1', { headers: H(travelerToken) });
  check('GET bookings of arbitrary host -> 403', r.status === 403, `got ${r.status}`);

  // booking creation: user_id forced to token identity, status forced pending
  const pkgs = await req('/api/packages');
  const pkg = pkgs.body?.data?.packages?.[0];
  if (pkg) {
    r = await req('/api/bookings', {
      method: 'POST',
      headers: JSONH(travelerToken),
      body: JSON.stringify({
        user_id: 999999,
        package_id: pkg.id,
        start_date: '2027-03-01',
        end_date: '2027-03-04',
        total_price: 1,
        status: 'confirmed',
        payment_status: 'completed',
        travelers: 2,
      }),
    });
    const b = r.body?.data?.booking;
    const expected = Number(pkg.price) * 2;
    check('POST booking ignores client user_id', r.status === 201 && Number(b?.user_id) === Number(travelerId), `status ${r.status} uid=${b?.user_id}`);
    check('POST booking forces pending status', b?.status === 'pending' && b?.payment_status === 'pending', `status=${b?.status}/${b?.payment_status}`);
    check('POST booking price computed server-side', Number(b?.total_price) === expected, `got ${b?.total_price} expected ${expected}`);

    if (b) {
      // traveler may cancel own booking
      r = await req(`/api/bookings/${b.id}`, {
        method: 'PUT',
        headers: JSONH(travelerToken),
        body: JSON.stringify({ status: 'confirmed' }),
      });
      check('traveler cannot self-confirm own booking -> 403', r.status === 403, `got ${r.status}`);

      r = await req(`/api/bookings/${b.id}`, {
        method: 'PUT',
        headers: JSONH(travelerToken),
        body: JSON.stringify({ status: 'cancelled' }),
      });
      check('traveler can cancel own booking -> 200', r.status === 200, `got ${r.status}`);

      r = await req(`/api/bookings/${b.id}`, {
        method: 'PUT',
        headers: JSONH(travelerToken),
        body: JSON.stringify({ payment_status: 'completed' }),
      });
      check('traveler cannot set payment_status -> 403', r.status === 403, `got ${r.status}`);

      // cleanup
      if (adminToken) {
        await req(`/api/bookings/${b.id}`, { method: 'DELETE', headers: H(adminToken) });
      }
    }
  } else {
    check('booking creation probe (no packages available)', false, 'skipped');
  }

  // ---- C3: host PII ----
  r = await req('/api/hosts');
  const hosts = r.body?.data?.hosts || [];
  const piiLeak = hosts.some((h) => h && (h.license_number || h.cnic_or_business_registration));
  check('GET /api/hosts anon PII scrubbed', r.status === 200 && !piiLeak, `status ${r.status} leak=${piiLeak}`);

  // ---- C4: host creation binds to token user ----
  const probeEmail = `probe+${Date.now()}@touristo.test`;
  const signup = await req('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Probe User', email: probeEmail, password: 'ProbePass123!', phone: '03001234567' }),
  });
  const probeToken = signup.body?.token;
  check('probe signup -> 201', signup.status === 201 && !!probeToken, `got ${signup.status}`);

  if (probeToken) {
    r = await req('/api/hosts', {
      method: 'POST',
      headers: JSONH(probeToken),
      body: JSON.stringify({ user_id: 999999, company_name: 'Probe Expeditions' }),
    });
    const created = r.body?.data?.host;
    check('POST /api/hosts binds owner from token', r.status === 201 && Number(created?.user_id) === Number(signup.body?.data?.user?.id), `status ${r.status} owner=${created?.user_id}`);

    r = await req('/api/hosts', {
      method: 'POST',
      headers: JSONH(probeToken),
      body: JSON.stringify({ company_name: 'Second Co' }),
    });
    check('second host profile rejected -> 409', r.status === 409, `got ${r.status}`);

    if (adminToken && created) {
      await req(`/api/hosts/${created.id}`, { method: 'DELETE', headers: H(adminToken) });
    }
  }

  // ---- H1/H2 ----
  r = await req('/api/trip-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'plan a trip' }),
  });
  check('POST /api/trip-planner anon -> 401', r.status === 401, `got ${r.status}`);

  r = await req('/api/homepage-data?userId=1');
  check('GET /api/homepage-data -> 200', r.status === 200, `got ${r.status}`);

  // ---- tour guide ownership ----
  r = await req('/api/tour-guides', {
    method: 'POST',
    headers: JSONH(travelerToken),
    body: JSON.stringify({ host_id: 1, name: 'Probe', specialty: 'Hiking' }),
  });
  check('POST tour guide on foreign host -> 403', r.status === 403, `got ${r.status}`);

  r = await req('/api/tour-guides/1', { method: 'DELETE', headers: H(travelerToken) });
  check('DELETE /api/tour-guides/1 non-owner -> 403/404', r.status === 403 || r.status === 404, `got ${r.status}`);

  // ---- error hygiene ----
  r = await req('/api/users/999999999', { headers: H(travelerToken) });
  const text = JSON.stringify(r.body || {});
  check('no hash/SQL in error paths', !text.includes('password_hash') && !text.includes('SELECT'), text.slice(0, 120));

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
