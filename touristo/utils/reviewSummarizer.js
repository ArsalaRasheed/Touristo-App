const aiService = require('../services/aiService');
const { query } = require('../config/database');

/**
 * Summarize reviews using AI.
 *
 * Returns a non-empty string on success. Returns `null` whenever a summary
 * could NOT be produced (AI not configured, provider failure, no key) so
 * callers can choose a transient message that is never written to the
 * cache - a cached failure would otherwise poison the package page forever.
 * @param {Array} reviews - Array of review objects
 * @returns {Promise<string|null>} Summary of reviews or null on failure
 */
async function summarizeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return "No reviews available for this package.";
  }

  if (!aiService.isAiConfigured()) {
    console.warn('AI API key not configured. Returning default summary.');
    return null;
  }

  // Format reviews for AI processing
  const formattedReviews = reviews.map(review => 
    `"${review.comment}" - Rating: ${review.rating}/5`
  ).join('\n\n');

  const prompt = `
    Please provide a concise 3-line summary of the following reviews for a tour package:
    
    ${formattedReviews}
    
    The summary should include:
    1. Overall sentiment (positive/negative/mixed)
    2. Standout positive aspects mentioned in the reviews
    3. Any recurring concerns or suggestions for improvement
    
    Keep the summary brief but informative.
  `;

  try {
    const result = await aiService.generateText({
      prompt,
      temperature: 0.3,
      maxOutputTokens: 300
    });

    return result.text;
  } catch (error) {
    if (error instanceof aiService.AIError) {
      console.warn(
        `[review-summary-ai] provider=${error.provider} code=${error.code}`
      );
    } else {
      console.error('Error generating review summary:', error);
    }

    // Null signals "transient failure" - the caller must not cache this.
    return null;
  }
}

/**
 * Get cached summary for a package or generate a new one
 * @param {number} packageId - ID of the package
 * @returns {string} Cached or newly generated summary
 */
async function getCachedSummary(packageId) {
  try {
    // Check if summary exists in cache
    const cacheResult = await query(`
      SELECT summary, updated_at
      FROM review_summaries
      WHERE package_id = $1
    `, [packageId]);

    if (cacheResult.rows.length > 0) {
      return cacheResult.rows[0].summary;
    }

    return null;
  } catch (error) {
    console.error('Error getting cached summary:', error);
    return null; // Return null instead of throwing to prevent crashes
  }
}

/**
 * Update or create cached summary for a package
 * @param {number} packageId - ID of the package
 * @param {string} summary - Summary text
 */
async function updateCachedSummary(packageId, summary) {
  try {
    // Check if record exists
    const existing = await query(`
      SELECT id FROM review_summaries WHERE package_id = $1
    `, [packageId]);

    if (existing.rows.length > 0) {
      // Update existing
      await query(`
        UPDATE review_summaries 
        SET summary = $1, updated_at = NOW()
        WHERE package_id = $2
      `, [summary, packageId]);
    } else {
      // Insert new
      await query(`
        INSERT INTO review_summaries (package_id, summary)
        VALUES ($1, $2)
      `, [packageId, summary]);
    }
  } catch (error) {
    console.error('Error updating cached summary:', error);
    // Don't throw to prevent crashes
  }
}

/**
 * Generate and cache review summary for a package
 * @param {number} packageId - ID of the package
 * @returns {string} Generated summary
 */
async function generateAndCacheSummary(packageId) {
  try {
    // Get all reviews for the package
    const reviewsResult = await query(`
      SELECT comment, rating
      FROM reviews
      WHERE package_id = $1
      ORDER BY created_at DESC
    `, [packageId]);

    const reviews = reviewsResult.rows;

    if (reviews.length === 0) {
      const noReviewsSummary = "No reviews available for this package yet. Be the first to share your experience!";
      await updateCachedSummary(packageId, noReviewsSummary);
      return noReviewsSummary;
    }

    // Generate summary using AI
    const summary = await summarizeReviews(reviews);

    // A failed/empty summary is a transient condition. Do NOT cache it,
    // otherwise a temporary provider outage would permanently replace the
    // real summary until a manual row edit.
    if (summary) {
      await updateCachedSummary(packageId, summary);
    }

    return summary || "AI summary is temporarily unavailable. Please try again later.";
  } catch (error) {
    console.error('Error generating and caching summary:', error);
    // Return a fallback instead of throwing
    return "Summary temporarily unavailable.";
  }
}

module.exports = {
  summarizeReviews,
  getCachedSummary,
  updateCachedSummary,
  generateAndCacheSummary
};