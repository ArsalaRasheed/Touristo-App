const aiService = require('../services/aiService');
const db = require('../config/database');

/*
|--------------------------------------------------------------------------
| AI Trip Planner
|--------------------------------------------------------------------------
|
| The model never sees or invents database facts on its own:
|
| 1. The server loads a small, explicit catalog (destinations + packages)
|    from the database and puts ONLY those rows into the prompt.
| 2. The model must answer with structured JSON: { message, packageIds }.
| 3. The server then re-validates every returned packageId against the
|    catalog it supplied - unknown ids are dropped before the response
|    leaves the process, so a hallucinated id can never reach a client.
| 4. Prices/descriptions in the response always come from the database
|    rows, never from the model text.
|
| If structured output cannot be parsed, one bounded retry is attempted
| and then a safe, typed AI error is returned.
|
|--------------------------------------------------------------------------
*/

const MAX_DESTINATIONS = 40;
const MAX_PACKAGES = 12;
const MAX_RECOMMENDATIONS = 4;
const MAX_MESSAGE_CHARS = 4000;

const loadCatalog = async () => {
  const empty = { destinations: [], packages: [] };

  try {
    const destinations = await db.query(
      `SELECT name FROM destinations ORDER BY name ASC LIMIT $1`,
      [MAX_DESTINATIONS]
    );

    const packages = await db.query(
      `SELECT id, title, description, price, duration_days, destination, image, group_size
         FROM (
           SELECT DISTINCT ON (destination)
                  id, title, description, price, duration_days, destination,
                  image, group_size, created_at
             FROM packages
            WHERE destination IS NOT NULL AND destination <> ''
            ORDER BY destination, created_at DESC
         ) AS latest_per_destination
        ORDER BY created_at DESC
        LIMIT $1`,
      [MAX_PACKAGES]
    );

    return {
      destinations: destinations.rows.map((row) => row.name).filter(Boolean),
      packages: packages.rows.map((row) => ({
        id: Number(row.id),
        title: row.title,
        description: row.description
          ? String(row.description).slice(0, 220)
          : '',
        price: Number(row.price),
        duration_days: row.duration_days ? Number(row.duration_days) : null,
        destination: row.destination || '',
        image: row.image || '',
        group_size: row.group_size || ''
      }))
    };
  } catch (error) {
    /*
     * A planner that still answers general travel questions is better
     * than a 500. Without a catalog we simply forbid recommendations.
     */
    console.warn('[trip-planner] catalog unavailable:', error.message);
    return empty;
  }
};

const buildPrompt = (message, catalog) => {
  const destinationList = catalog.destinations.length
    ? catalog.destinations.map((name) => `- ${name}`).join('\n')
    : '- (no destinations available)';

  const packageList = catalog.packages.length
    ? JSON.stringify(catalog.packages, null, 0)
    : '[]';

  return `You are the Touristo travel assistant for Pakistan.

RULES (never break these):
- Answer in the SAME language and script the user used (English, Urdu script, or Roman Urdu).
- Only mention destinations that appear in the DESTINATIONS list below.
- Only recommend packages by copying their exact "id" from the PACKAGES list below.
- Never invent package ids, prices, availability, ratings, or bookings.
- Quote a price only if it appears in the PACKAGES list.
- Be concise: 3-5 short sentences, use **bold** for key places.
- If you cannot find a suitable package, return an empty packageIds array.

DESTINATIONS available:
${destinationList}

PACKAGES available (id, title, price, duration_days, destination):
${packageList}

USER REQUEST:
"${String(message).trim()}"`;
};

const validatePackageIds = (rawIds, catalog) => {
  const allowed = new Map(
    catalog.packages.map((pkg) => [pkg.id, pkg])
  );

  if (!Array.isArray(rawIds)) {
    return [];
  }

  const seen = new Set();
  const resolved = [];

  for (const raw of rawIds) {
    const id = Number(raw);

    if (!Number.isInteger(id) || !allowed.has(id) || seen.has(id)) {
      continue;
    }

    seen.add(id);
    resolved.push(allowed.get(id));

    if (resolved.length >= MAX_RECOMMENDATIONS) {
      break;
    }
  }

  return resolved;
};

const normalizeMessage = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, MAX_MESSAGE_CHARS);
};

const planTrip = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message is required'
      });
    }

    const catalog = await loadCatalog();
    const basePrompt = buildPrompt(message, catalog);

    const jsonInstruction = `${basePrompt}

RESPOND WITH STRICT JSON ONLY (no markdown fences, no prose around it):
{"message":"<your reply to the user>","packageIds":[<ids from the PACKAGES list you want to recommend>]}`;

    let parsed = null;
    let provider = null;

    try {
      const result = await aiService.generateJson({
        prompt: jsonInstruction,
        temperature: 0.4,
        maxOutputTokens: 900
      });

      parsed = result.data;
      provider = result.provider;
    } catch (error) {
      const canRetry =
        error instanceof aiService.AIError &&
        error.code === 'invalid_output';

      if (!canRetry) {
        throw error;
      }

      /*
       * One bounded retry with an even stricter instruction, then we
       * stop instead of burning more quota.
       */
      const retry = await aiService.generateJson({
        prompt:
          `${jsonInstruction}\n\nReturn ONLY a valid JSON object. ` +
          `Any text before or after the JSON is an error.`,
        temperature: 0,
        maxOutputTokens: 900
      });

      parsed = retry.data;
      provider = retry.provider;
    }

    const reply = normalizeMessage(parsed && parsed.message);

    if (!reply) {
      throw new aiService.AIError('invalid_output');
    }

    const recommendedPackages = validatePackageIds(
      parsed ? parsed.packageIds : [],
      catalog
    );

    return res.status(200).json({
      status: 'success',
      message: reply,
      provider,
      recommendedPackages
    });
  } catch (error) {
    if (error instanceof aiService.AIError) {
      return res.status(error.status).json({
        status: 'error',
        code: error.code,
        message: error.message
      });
    }

    console.error('Error in planTrip:', error);

    return res.status(500).json({
      status: 'error',
      code: 'unknown',
      message:
        'Failed to process trip planning request. Please try again in a moment.'
    });
  }
};

module.exports = {
  planTrip
};
