const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const recommendGuide = async (req, res) => {
  try {
    const { guides, preference } = req.body;

    if (!guides || !Array.isArray(guides) || guides.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tour guides are required'
      });
    }

    if (!preference || !preference.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Guide preference is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash'
    });

    const guideData = guides.map((guide) => ({
      id: guide.id,
      name: guide.name,
      specialty: guide.specialty,
      rating: guide.rating
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let recommendation;

    try {
      recommendation = JSON.parse(text);
    } catch (parseError) {
      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      recommendation = JSON.parse(cleanedText);
    }

    const recommendedGuide = guides.find(
      (guide) =>
        String(guide.id) === String(recommendation.recommendedGuideId)
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
        reason: recommendation.reason
      }
    });

  } catch (error) {
    console.error('Error recommending tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to recommend tour guide',
      error: error.message
    });
  }
};

module.exports = {
  recommendGuide
};