const { query } = require('../config/database');
const Package = require('../models/package'); // Fix the path to match typical Node.js conventions

/**
 * Get personalized recommendations for a user based on their history
 * @param {number} userId - ID of the user
 * @returns {Array} Array of recommended packages
 */
async function getPersonalizedRecommendations(userId) {
  try {
    // First, try to get recommendations based on user's booking/search history
    const userHistory = await getUserHistory(userId);
    
    if (userHistory && userHistory.length > 0) {
      // Based on user's past bookings, find similar packages
      const recommendedPackages = await getRecommendationsFromHistory(userHistory);
      if (recommendedPackages && recommendedPackages.length > 0) {
        return recommendedPackages;
      }
    }
    
    // Fallback to trending/popular packages if no history exists
    return await getTrendingPackages();
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    // Return trending packages as fallback if there's an error
    try {
      return await getTrendingPackages();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Get user's booking and search history
 * @param {number} userId - ID of the user
 * @returns {Array} Array of user's past activities
 */
async function getUserHistory(userId) {
  try {
    if (!userId) {
      return [];
    }
    
    // Get user's past bookings
    const bookingsResult = await query(`
      SELECT b.package_id, p.destination_id, p.title
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [userId]);
    
    // Get user's viewed packages (assuming we track this somehow)
    // For now, we'll just return bookings as history
    return bookingsResult.rows || [];
  } catch (error) {
    console.error('Error in getUserHistory:', error);
    return [];
  }
}

/**
 * Get recommendations based on user's history
 * @param {Array} userHistory - User's past activities
 * @returns {Array} Array of recommended packages
 */
async function getRecommendationsFromHistory(userHistory) {
  try {
    if (!userHistory || userHistory.length === 0) {
      return [];
    }
    
    // Extract destination IDs from user's history
    const destinationIds = [...new Set(userHistory.map(item => item.destination_id).filter(id => id))];
    
    // Get packages from similar destinations
    if (destinationIds.length > 0) {
      const placeholders = destinationIds.map((_, i) => `$${i + 1}`).join(',');
      const userIdPlaceholder = destinationIds.length + 1;
      
      const similarPackagesResult = await query(`
        SELECT DISTINCT p.*
        FROM packages p
        WHERE p.destination_id IN (${placeholders})
        AND p.id NOT IN (
          SELECT package_id FROM bookings WHERE user_id = $${userIdPlaceholder}
        )
        ORDER BY p.created_at DESC
        LIMIT 10
      `, [...destinationIds, userHistory[0].user_id]); // Using first item's user_id
      
      return similarPackagesResult.rows.map(row => new Package(row));
    }
    
    return [];
  } catch (error) {
    console.error('Error in getRecommendationsFromHistory:', error);
    return [];
  }
}

/**
 * Get trending/popular packages as fallback
 * @returns {Array} Array of trending packages
 */
async function getTrendingPackages() {
  try {
    // Get packages with highest booking counts or recent activity
    const trendingResult = await query(`
      SELECT p.*, COALESCE(COUNT(b.id), 0) as booking_count
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      GROUP BY p.id
      ORDER BY booking_count DESC, p.created_at DESC
      LIMIT 10
    `);
    
    return trendingResult.rows.map(row => new Package(row));
  } catch (error) {
    console.error('Error in getTrendingPackages:', error);
    return [];
  }
}

module.exports = {
  getPersonalizedRecommendations
};