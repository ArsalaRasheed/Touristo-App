const aiService = require('../services/aiService');

const MAX_GUIDES_TO_SEND = 30;
const MAX_PREFERENCE_LENGTH = 500;

const recommendGuide = async (req, res) => {
  try {
    let { guides, preference } = req.body;

    if (!guides || !Array.isArray(guides) || guides.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tour guides are required'
      });
    }

    if (!preference || !String(preference).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Guide preference is required'
      });
    }

    preference = String(preference).trim();

    if (preference.length > MAX_PREFERENCE_LENGTH) {
      preference = preference.slice(0, MAX_PREFERENCE_LENGTH);
    }

    const guideData = guides
      .slice(0, MAX_GUIDES_TO_SEND)
      .map((guide) => ({
        id: guide.id,
        name:
          typeof guide.name === 'string'
            ? guide.name.slice(0, 100)
            : String(guide.id ?? ''),
        specialty:
          typeof guide.specialty === 'string'
            ? guide.specialty.slice(0, 100)
            : '',
        rating: Number.isFinite(Number(guide.rating))
          ? guide.rating
          : null
      }));

    const prompt = `
You are an AI tour guide recommendation assistant for Touristo.

The traveler wants to choose the best tour guide from ONE specific travel company.

Traveler preference:
"${preference}"

Available tour guides:
${JSON.stringify(guideData, null, 2)}

Choose the SINGLE best guide based only on the available guides and the traveler's preference.

Consider:
- Language preference
- Family friendliness
- Guide specialty
- Rating
- Overall suitability

Return ONLY valid JSON in exactly this format:

{
  "recommendedGuideId": "ID",
  "recommendedGuideName": "Guide Name",
  "reason": "Short explanation of why this guide is the best match."
}

Do not add markdown.
Do not add extra text.
`;

    let recommendation;
    let provider;

    try {
      const result = await aiService.generateJson({
        prompt,
        temperature: 0.2,
        maxOutputTokens: 1200
      });
      recommendation = result.data;
      provider = result.provider;
    } catch (error) {
      const canRetry =
        error instanceof aiService.AIError &&
        error.code === 'invalid_output';

      if (!canRetry) {
        throw error;
      }

      /*
       * One bounded retry with a stricter instruction and no creativity,
       * then stop instead of burning more quota.
       */
      const retry = await aiService.generateJson({
        prompt:
          `${prompt}\n\nReturn ONLY a single valid JSON object. ` +
          `Any markdown, prose or trailing text is a failure.`,
        temperature: 0,
        maxOutputTokens: 1200
      });
      recommendation = retry.data;
      provider = retry.provider;
    }

    const recommendedGuide = guides.find(
      (guide) =>
        String(guide.id) ===
        String(recommendation.recommendedGuideId)
    );

    if (!recommendedGuide) {
      return res.status(404).json({
        success: false,
        message: 'AI recommended guide was not found in available guides'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recommendedGuideId: recommendedGuide.id,
        recommendedGuideName: recommendedGuide.name,
        reason:
          typeof recommendation.reason === 'string'
            ? recommendation.reason
            : '(no reason provided)'
      }
    });

  } catch (error) {
    if (error instanceof aiService.AIError) {
      return res.status(error.status).json({
        success: false,
        code: error.code,
        message: error.message
      });
    }

    console.error('Error recommending tour guide:', error);

    res.status(500).json({
      success: false,
      code: 'unknown',
      message:
        'Failed to recommend tour guide. Please try again in a moment.'
    });
  }
};

module.exports = {
  recommendGuide
};