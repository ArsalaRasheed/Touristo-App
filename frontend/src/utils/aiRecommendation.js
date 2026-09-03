/**
 * Utility functions for AI-powered tour guide recommendations
 */

// Function to get AI recommendation for the best tour guide
export const getAIGuideRecommendation = async (travelPreferences, tourGuides) => {
  // In a real implementation, we would call the Gemini API here
  // For now, we'll simulate the API call with a timeout and return a mock response
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple algorithm to find the best matching guide based on specialty keywords
  const preferenceKeywords = travelPreferences.toLowerCase().split(/\s+/);
  
  // Score each guide based on how well their specialty matches the preferences
  const scoredGuides = tourGuides.map(guide => {
    const specialty = guide.specialty.toLowerCase();
    let score = 0;
    
    // Increase score for each matching keyword
    preferenceKeywords.forEach(keyword => {
      if (specialty.includes(keyword)) {
        score += 1;
      }
    });
    
    // Additional scoring for common tourism-related terms
    if (specialty.includes('family') && travelPreferences.toLowerCase().includes('family')) {
      score += 2;
    }
    if (specialty.includes('trekking') && travelPreferences.toLowerCase().includes('trek')) {
      score += 2;
    }
    if (specialty.includes('culture') && travelPreferences.toLowerCase().includes('culture')) {
      score += 2;
    }
    
    return { ...guide, score };
  });
  
  // Sort guides by score (descending) and rating (descending) as tiebreaker
  scoredGuides.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.rating - a.rating; // Higher rated guides come first if scores are equal
  });
  
  // Return the top recommendation with an explanation
  const topGuide = scoredGuides[0];
  let explanation = '';
  
  if (topGuide.score > 0) {
    explanation = `Based on your interest in "${travelPreferences}", I recommend ${topGuide.name} because their specialty in "${topGuide.specialty}" closely matches your preferences.`;
  } else {
    explanation = `For your "${travelPreferences}" trip, I recommend ${topGuide.name}. They are highly rated (${topGuide.rating}) and have expertise in "${topGuide.specialty}".`;
  }
  
  return {
    recommendedGuide: topGuide,
    explanation: explanation,
    allRecommendations: scoredGuides.slice(0, 3) // Top 3 recommendations
  };
};

// Function to call the actual Gemini API (placeholder implementation)
export const callGeminiAPI = async (prompt) => {
  // This is a placeholder - in a real implementation, we would:
  // 1. Have the API key securely stored (likely in environment variables)
  // 2. Make a POST request to the Gemini API endpoint
  // 3. Process the response
  
  /*
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  */
  
  // For now, return the mock implementation
  return null;
};