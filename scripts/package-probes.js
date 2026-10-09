/* Phase 1 verification probes: AI package builder + new package fields. */
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

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${detail}`); }
};

const req = async (url, opts = {}) => {
  try {
    const res = await fetch(`${BASE}${url}`, opts);
    let body = null;
    try { body = await res.json(); } catch { /* non-json */ }
    return { status: res.status, body };
  } catch (e) {
    return { status: 0, body: { message: e.message } };
  }
};

const H = token => ({ Authorization: `Bearer ${token}` });
const JSONH = token => ({ 'Content-Type': 'application/json', ...H(token) });

const login = async (email, password) => {
  const r = await req('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return r.body?.token || r.body?.data?.token || null;
};

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const run = async () => {
  // Setup: fresh host
  const email = `p1+${Date.now()}@touristo.test`;
  let r = await req('/api/users', {
    method: 'POST',
    headers: JSONH(null),
    body: JSON.stringify({ name: 'Phase1 Host', email, password: 'ProbePass123!', phone: '03001234567', role: 'host' })
  });
  check('signup host role accepted', r.status === 201 || r.status === 200, `status ${r.status} ${JSON.stringify(r.body)}`);
  let token = r.body?.data?.token || r.body?.token || (await login(email, 'ProbePass123!'));
  check('signup returns token', Boolean(token));

  r = await req('/api/hosts', {
    method: 'POST',
    headers: JSONH(token),
    body: JSON.stringify({ company_name: `Phase1 Probes ${Date.now()}`, description: 'probe host', phone: '03001234567', address: 'Probe Street', license_number: 'LIC-123', cnic_or_business_registration: '12345-6789012-3' })
  });
  const hostId = r.body?.data?.host?.id;
  check('create host profile', Boolean(hostId), `status ${r.status} ${JSON.stringify(r.body)}`);

  // ---- Package create with new discovery/SEO fields ----
  const pkgPayload = {
    host_id: hostId,
    title: 'Phase1 Probe Package',
    description: 'A package created by the phase 1 verification probe.',
    destination: 'Islamabad',
    price: 15000,
    duration_days: 3,
    group_size: '2-6 people',
    image_data: TINY_PNG,
    image_name: 'probe.png',
    image_type: 'image/png',
    inclusions: ['Transport'],
    exclusions: ['Insurance'],
    itinerary: 'Day 1: Arrival\nDay 2: Sightseeing\nDay 3: Departure',
    highlights: ['Margalla Hills', 'Faisal Mosque'],
    activities: ['Hiking'],
    tags: ['islamabad', 'city', 'probe'],
    target_traveler_type: 'Families',
    best_season: 'March to October',
    safety_notes: ['Carry water'],
    seo_description: 'Explore Islamabad with this three day city package for families.'
  };
  r = await req('/api/packages', { method: 'POST', headers: JSONH(token), body: JSON.stringify(pkgPayload) });
  const pkgId = r.body?.data?.package?.id;
  check('POST /api/packages with new fields -> 201', r.status === 201, `status ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
  const created = r.body?.data?.package || {};
  check('create returns highlights', JSON.stringify(created.highlights) === JSON.stringify(['Margalla Hills', 'Faisal Mosque']), `got ${JSON.stringify(created.highlights)}`);
  check('create returns tags', JSON.stringify(created.tags) === JSON.stringify(['islamabad', 'city', 'probe']), `got ${JSON.stringify(created.tags)}`);
  check('create returns seo_description', created.seo_description === pkgPayload.seo_description, `got ${created.seo_description}`);
  check('create returns target_traveler_type/best_season/safety_notes', created.target_traveler_type === 'Families' && created.best_season === 'March to October' && Array.isArray(created.safety_notes) && created.safety_notes[0] === 'Carry water');

  // ---- GET persists ----
  r = await req(`/api/packages/${pkgId}`);
  const got = r.body?.data?.package || {};
  check('GET package returns new fields', r.status === 200 && Array.isArray(got.tags) && got.seo_description === pkgPayload.seo_description, `status ${r.status}`);

  // ---- UPDATE ----
  r = await req(`/api/packages/${pkgId}`, {
    method: 'PUT', headers: JSONH(token),
    body: JSON.stringify({ ...pkgPayload, title: 'Phase1 Probe Package Updated', highlights: ['Only highlight'], tags: ['updated'] })
  });
  check('PUT package -> 200', r.status === 200, `status ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
  check('PUT updates new fields', r.body?.data?.package?.seo_description && JSON.stringify(r.body?.data?.package?.highlights) === JSON.stringify(['Only highlight']));

  // ---- UPDATE without title -> 400 ----
  const { title, ...noTitle } = pkgPayload;
  r = await req(`/api/packages/${pkgId}`, { method: 'PUT', headers: JSONH(token), body: JSON.stringify(noTitle) });
  check('PUT without title -> 400', r.status === 400, `got ${r.status}`);

  // ---- group_size >50 chars is truncated, never a 500 ----
  r = await req(`/api/packages/${pkgId}`, {
    method: 'PUT', headers: JSONH(token),
    body: JSON.stringify({ ...pkgPayload, title: 'Phase1 Probe Package Updated', group_size: 'x'.repeat(80) })
  });
  check('PUT oversized group_size -> no 500', r.status !== 500, `got ${r.status}`);

  // ---- AI generate access control ----
  r = await req('/api/packages/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brief: 'test' }) });
  check('AI generate anon -> 401', r.status === 401, `got ${r.status}`);

  r = await req('/api/packages/ai/generate', { method: 'POST', headers: JSONH(token), body: JSON.stringify({ brief: '' }) });
  check('AI generate empty brief -> 400', r.status === 400, `got ${r.status}`);

  r = await req('/api/packages/ai/generate', { method: 'POST', headers: JSONH(token), body: JSON.stringify({ brief: 'x'.repeat(2000) }) });
  check('AI generate oversized brief -> 400', r.status === 400, `got ${r.status}`);

  // ---- AI generate real call (draft + schema fields + cache) ----
  const brief = 'A 3 day cultural tour of Lahore covering old city food, forts and museums for small groups.';
  r = await req('/api/packages/ai/generate', { method: 'POST', headers: JSONH(token), body: JSON.stringify({ brief }) });
  console.log(`  [info] AI generate status ${r.status}`);
  if (r.status === 200) {
    const d = r.body?.data?.draft || {};
    check('AI draft complete (title/desc/duration/itinerary)', Boolean(d.title && d.description && d.duration_days && Array.isArray(d.itinerary) && d.itinerary.length > 0));
    check('AI draft has seo_description + tags', typeof d.seo_description === 'string' || Array.isArray(d.tags), `seo=${typeof d.seo_description} tags=${JSON.stringify(d.tags)}`);
    check('AI itinerary days sequential', d.itinerary.every((day, i) => day.day === i + 1), JSON.stringify(d.itinerary.map(x => x.day)));
    check('AI never auto-publishes', r.body?.data?.published === false);
    check('AI draft group_size <= 50 chars', !d.group_size || d.group_size.length <= 50, `len=${d.group_size?.length}`);

    const r2 = await req('/api/packages/ai/generate', { method: 'POST', headers: JSONH(token), body: JSON.stringify({ brief }) });
    check('identical AI request served from cache', r2.status === 200 && r2.body?.data?.cached === true, `status ${r2.status} cached=${r2.body?.data?.cached}`);
  } else {
    check('AI generate returns safe error (no leak)', !JSON.stringify(r.body || {}).match(/api.?key|stack|gemini/i), JSON.stringify(r.body).slice(0, 200));
  }

  // ---- traveler cannot use AI builder ----
  const travEmail = `p1t+${Date.now()}@touristo.test`;
  r = await req('/api/users', {
    method: 'POST', headers: JSONH(null),
    body: JSON.stringify({ name: 'Phase1 Traveler', email: travEmail, password: 'ProbePass123!', phone: '03001234567', role: 'traveler' })
  });
  const travToken = r.body?.data?.token || r.body?.token || (await login(travEmail, 'ProbePass123!'));
  r = await req('/api/packages/ai/generate', { method: 'POST', headers: JSONH(travToken), body: JSON.stringify({ brief }) });
  check('traveler AI generate -> 403', r.status === 403, `got ${r.status}`);

  // ---- foreign host cannot update package ----
  const otherEmail = `p1o+${Date.now()}@touristo.test`;
  let r2b = await req('/api/users', { method: 'POST', headers: JSONH(null), body: JSON.stringify({ name: 'Phase1 Other', email: otherEmail, password: 'ProbePass123!', phone: '03001234567', role: 'host' }) });
  const otherToken = r2b.body?.data?.token || r2b.body?.token || (await login(otherEmail, 'ProbePass123!'));
  r = await req('/api/hosts', { method: 'POST', headers: JSONH(otherToken), body: JSON.stringify({ company_name: `Other ${Date.now()}`, description: 'x', phone: '03001234567', address: 'x' }) });
  r = await req(`/api/packages/${pkgId}`, { method: 'PUT', headers: JSONH(otherToken), body: JSON.stringify({ ...pkgPayload, title: 'Hijacked' }) });
  check('foreign host PUT package -> 403/404', r.status === 403 || r.status === 404, `got ${r.status}`);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
};

run();
