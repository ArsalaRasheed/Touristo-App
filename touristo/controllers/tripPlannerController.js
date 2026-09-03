const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Main function to handle trip planning request
const planTrip = async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Validate inputs
    if (!message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message is required'
      });
    }
    
    // Verify API key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'AI service is not configured'
      });
    }
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    // Prepare context for the AI - this helps ground responses in our actual data
    const prompt = `
      You are a helpful travel assistant for Touristo, a platform that connects travelers with verified tour operators in Pakistan.
      Your task is to help users plan trips based on their preferences.
      Always respond in the same language/script the user used (English, Urdu script, or Roman Urdu).
      
      User request: "${message}"
      
      Provide a concise, friendly response with helpful travel advice.
      Structure your response clearly with:
      1. Acknowledgment of their request
      2. Key recommendations or information
      3. Any follow-up questions if needed
      
      Use **bold** formatting for important keywords, destinations, or recommendations.
      Keep your response under 3-4 sentences when possible.
      Be helpful but concise.
    `;
    
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Return the AI-generated response
    res.status(200).json({
      status: 'success',
      message: text,
      recommendedPackages: [] // Empty array for now until database is working
    });
    
  } catch (error) {
    console.error('Error in planTrip:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process trip planning request',
      error: error.message
    });
  }
};

module.exports = {
  planTrip
};