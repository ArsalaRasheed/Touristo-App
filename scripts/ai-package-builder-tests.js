/* Verifies aiGeneratePackage success path (sanitize, prompt flow, cache) with a stubbed model call. */
const fs = require('fs');
const path = require('path');
const root = process.cwd();

for (const line of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

const aiService = require(path.join(root, 'touristo', 'services', 'aiService'));

const MOCK_DRAFT = {
  title: 'Lahore Food and Heritage Walk',
  description: 'x'.repeat(250),
  destination: 'Lahore',
  duration_days: 3,
  group_size: 'A group size string that is deliberately longer than fifty characters to test clamping',
  target_traveler_type: 'Food lovers',
  highlights: ['Badshahi Mosque', 'Food Street'],
  activities: ['Walking tour'],
  inclusions: ['Guide'],
  exclusions: ['Lunch'],
  itinerary: [
    { day: 1, title: 'Arrival', description: 'Arrive and settle in.' },
    { day: 2, title: 'Old city', description: 'Explore the walled city.' },
    { day: 3, title: 'Departure', description: 'Departure.' },
    { day: 4, title: 'Extra', description: 'Extra day that exceeds duration.' }
  ],
  best_season: 'October to March',
  safety_notes: ['Stay hydrated'],
  seo_description: 'S'.repeat(400),
  tags: ['lahore', 'food', 'heritage', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11'],
  suggested_price: 999999
};

aiService.generateJson = async () => ({
  data: MOCK_DRAFT,
  provider: 'stub',
  latencyMs: 0
});

const pkgController = require(path.join(root, 'touristo', 'controllers', 'packageController'));

const makeRes = () => {
  const res = {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.payload = body; return this; }
  };
  return res;
};

const run = async () => {
  let pass = 0, fail = 0;
  const check = (name, ok, detail = '') => {
    if (ok) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; console.log(`  FAIL  ${name} ${detail}`); }
  };

  const req = {
    user: { id: 4242, role: 'host' },
    body: { brief: 'A three day food tour of Lahore.', details: { duration_days: 3, budget_per_person: 50000 } }
  };
  const res = makeRes();

  await pkgController.aiGeneratePackage(req, res);
  check('success path -> 200', res.statusCode === 200, `got ${res.statusCode} ${JSON.stringify(res.payload).slice(0, 200)}`);

  const d = res.payload?.data?.draft || {};
  check('group_size clamped to <=50 chars', !d.group_size || d.group_size.length <= 50, `len=${d.group_size?.length}`);
  check('seo_description clamped <=160', !d.seo_description || d.seo_description.length <= 160, `len=${d.seo_description?.length}`);
  check('tags capped at 10', Array.isArray(d.tags) && d.tags.length <= 10, `len=${d.tags?.length}`);
  check('itinerary trimmed to duration_days', Array.isArray(d.itinerary) && d.itinerary.length === 3, `len=${d.itinerary?.length}`);
  check('itinerary days re-sequenced 1..n', Array.isArray(d.itinerary) && d.itinerary.every((x, i) => x.day === i + 1), JSON.stringify((d.itinerary || []).map(x => x.day)));
  check('suggested_price clamped to budget', d.suggested_price === 50000, `got ${d.suggested_price}`);
  check('published flag false', res.payload?.data?.published === false);
  check('cache flag not set on first call', res.payload?.data?.cached === undefined, `got ${res.payload?.data?.cached}`);

  const res2 = makeRes();
  await pkgController.aiGeneratePackage(req, res2);
  check('second identical call -> cache hit', res2.statusCode === 200 && res2.payload?.data?.cached === true, `status ${res2.statusCode} cached=${res2.payload?.data?.cached}`);

  const res3 = makeRes();
  await pkgController.aiGeneratePackage({ user: { id: 4243, role: 'host' }, body: req.body }, res3);
  check('different user -> cache miss (fresh draft)', res3.statusCode === 200 && res3.payload?.data?.cached === undefined, `cached=${res3.payload?.data?.cached}`);

  const res4 = makeRes();
  await pkgController.aiGeneratePackage({ user: { id: 1, role: 'traveler' }, body: req.body }, res4);
  check('non-host role -> 403', res4.statusCode === 403, `got ${res4.statusCode}`);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
};

run().catch(e => { console.error('UNCAUGHT', e); process.exit(1); });
