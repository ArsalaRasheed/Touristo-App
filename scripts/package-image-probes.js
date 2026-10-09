/* Package image persistence probes: upload -> storage -> DB -> API -> re-read. */
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

const JSONH = token => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

const login = async (email, password) => {
  const r = await req('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return r.body?.token || r.body?.data?.token || null;
};

// 1x1 red PNG
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
// 1x1 JPEG
const JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==';

const run = async () => {
  const email = `img+${Date.now()}@touristo.test`;
  let r = await req('/api/users', {
    method: 'POST',
    headers: JSONH(null),
    body: JSON.stringify({ name: 'Image Probe Host', email, password: 'ProbePass123!', phone: '03001234567', role: 'host' })
  });
  let token = r.body?.data?.token || r.body?.token || (await login(email, 'ProbePass123!'));
  check('host signup + token', Boolean(token));

  r = await req('/api/hosts', {
    method: 'POST',
    headers: JSONH(token),
    body: JSON.stringify({ company_name: `Image Probes ${Date.now()}`, description: 'probe host', phone: '03001234567', address: 'Probe Street', license_number: 'LIC-123', cnic_or_business_registration: '12345-6789012-3' })
  });
  const hostId = r.body?.data?.host?.id;
  check('create host profile', Boolean(hostId), `status ${r.status}`);

  const payload = {
    host_id: hostId,
    title: 'Image Probe Package',
    description: 'Package created to verify image persistence end to end.',
    destination: 'Islamabad',
    price: 12000,
    duration_days: 2,
    group_size: '2-4 people',
    itinerary: 'Day 1: Arrival\nDay 2: Departure',
    image_data: PNG,
    image_name: 'probe.png',
    image_type: 'image/png'
  };

  r = await req('/api/packages', { method: 'POST', headers: JSONH(token), body: JSON.stringify(payload) });
  const created = r.body?.data?.package || {};
  const pkgId = created.id;
  check('create package with image -> 201', r.status === 201, `status ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
  check('create response carries image URL', typeof created.image === 'string' && created.image.length > 0, `image=${created.image}`);
  check('stored image is an absolute http(s) URL', /^https?:\/\//.test(created.image || ''), `image=${created.image}`);

  // Storage object must actually resolve (public read).
  if (created.image) {
    try {
      const imgRes = await fetch(created.image, { method: 'GET' });
      check('stored image URL is publicly reachable', imgRes.ok, `status ${imgRes.status}`);
      const ctype = imgRes.headers.get('content-type') || '';
      check('stored image serves image content-type', ctype.startsWith('image/'), `content-type ${ctype}`);
    } catch (e) {
      check('stored image URL is publicly reachable', false, e.message);
    }
  }

  // Re-read through the API (detail).
  r = await req(`/api/packages/${pkgId}`);
  const got = r.body?.data?.package || {};
  check('GET detail returns persisted image', r.status === 200 && got.image === created.image, `got=${got.image}`);

  // Re-read through list endpoint.
  r = await req('/api/packages');
  const listed = (r.body?.data?.packages || []).find(p => p.id === pkgId);
  check('GET list returns persisted image', Boolean(listed) && listed.image === created.image, `got=${listed?.image}`);

  // Host packages endpoint.
  r = await req(`/api/packages/host/${hostId}`);
  const hosted = (r.body?.data?.packages || []).find(p => p.id === pkgId);
  check('GET host packages returns persisted image', Boolean(hosted) && hosted.image === created.image, `got=${hosted?.image}`);

  // Edit without sending a new image must keep the existing image.
  const { image_data: _imgData, image_name: _imgName, image_type: _imgType, ...keepImagePayload } = payload;
  r = await req(`/api/packages/${pkgId}`, {
    method: 'PUT',
    headers: JSONH(token),
    body: JSON.stringify({ ...keepImagePayload, title: 'Image Probe Package Edited' })
  });
  const kept = r.body?.data?.package || {};
  check('PUT without new image keeps existing image', r.status === 200 && kept.image === created.image, `status ${r.status} got=${kept.image}`);

  // Replace the image with a JPEG upload.
  r = await req(`/api/packages/${pkgId}`, {
    method: 'PUT',
    headers: JSONH(token),
    body: JSON.stringify({ ...payload, image_data: JPEG, image_name: 'probe.jpg', image_type: 'image/jpeg' })
  });
  const replaced = r.body?.data?.package || {};
  check('PUT with new image replaces it', r.status === 200 && typeof replaced.image === 'string' && replaced.image !== created.image, `status ${r.status} got=${replaced.image}`);

  if (replaced.image && replaced.image !== created.image) {
    try {
      const imgRes = await fetch(replaced.image, { method: 'GET' });
      check('replaced image URL is publicly reachable', imgRes.ok, `status ${imgRes.status}`);
    } catch (e) {
      check('replaced image URL is publicly reachable', false, e.message);
    }
  }

  // Rejected inputs: no bogus storage path / no data URL stored verbatim.
  check('image column never stores raw base64', !(replaced.image || '').startsWith('data:'), `got=${(replaced.image || '').slice(0, 40)}`);

  // Create without an image must fail safely.
  const { image_data, image_name, image_type, ...noImage } = payload;
  r = await req('/api/packages', { method: 'POST', headers: JSONH(token), body: JSON.stringify(noImage) });
  check('create without image -> 400', r.status === 400, `got ${r.status}`);

  // Wrong MIME type must be rejected without leaking internals.
  const { image_data: _evil, ...validPayload } = payload;
  r = await req('/api/packages', {
    method: 'POST',
    headers: JSONH(token),
    body: JSON.stringify({ ...validPayload, image_data: 'data:text/html;base64,PGI+dGVzdDwvYj4=', image_name: 'evil.html', image_type: 'text/html' })
  });
  check('non-image MIME rejected with friendly 400', r.status === 400 && !/stack|supabase\.co\/storage/i.test(JSON.stringify(r.body || {})), `got ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
};

run();
