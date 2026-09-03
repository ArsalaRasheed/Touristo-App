const { query } = require('../config/database');

/**
 * Calculate host ranking score based on weighted factors
 * @param {number} reviewScore - Average review score (0-5)
 * @param {number} responseTimeHours - Average response time in hours (lower is better)
 * @param {number} completionRate - Completion rate percentage (0-100)
 * @returns {object} Object containing ranking score and badge
 */
function calculateHostRanking(reviewScore, responseTimeHours, completionRate) {
  // Normalize values to 0-100 scale
  const normalizedReviewScore = Math.min(100, (reviewScore / 5) * 100);
  // Invert response time so lower time gets higher score (max 48 hours considered)
  const normalizedResponseTime = Math.max(0, 100 - (Math.min(responseTimeHours, 48) / 48) * 100);
  const normalizedCompletionRate = completionRate; // Already 0-100
  
  // Apply weights: review score (40%), response time (30%), completion rate (30%)
  const rankingScore = (
    (normalizedReviewScore * 0.4) +
    (normalizedResponseTime * 0.3) +
    (normalizedCompletionRate * 0.3)
  );

  // Determine ranking badge based on score
  let rankingBadge;
  if (rankingScore >= 90) {
    rankingBadge = 'Top Rated';
  } else if (rankingScore >= 80) {
    rankingBadge = 'Highly Recommended';
  } else if (rankingScore >= 70) {
    rankingBadge = 'Rising Host';
  } else if (rankingScore >= 60) {
    rankingBadge = 'Trusted Operator';
  } else {
    rankingBadge = 'New Host';
  }

  return {
    rankingScore: Math.round(rankingScore),
    rankingBadge
  };
}

/**
 * Get host statistics including ranking metrics
 * @param {number} hostId - ID of the host
 * @returns {object} Object containing host statistics for ranking calculation
 */
async function getHostStatistics(hostId) {
  try {
    // Get average rating
    const ratingResult = await query(`
      SELECT AVG(r.rating) as avg_rating
      FROM reviews r
      WHERE r.package_id IN (
        SELECT p.id FROM packages p WHERE p.host_id = $1
      )
    `, [hostId]);
    
    const avgRating = parseFloat(ratingResult.rows[0]?.avg_rating) || 0;
    
    // Get average response time (mock data since we don't have this field in the schema)
    // In a real implementation, we would track communication logs to calculate response times
    const avgResponseTime = 6; // Mock value in hours
    
    // Get completion rate (based on confirmed bookings vs total bookings)
    const bookingStatsResult = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings
      FROM bookings b
      WHERE b.package_id IN (
        SELECT p.id FROM packages p WHERE p.host_id = $1
      )
    `, [hostId]);
    
    const totalBookings = parseInt(bookingStatsResult.rows[0]?.total_bookings) || 1;
    const completedBookings = parseInt(bookingStatsResult.rows[0]?.completed_bookings) || 0;
    const completionRate = (completedBookings / totalBookings) * 100 || 0;

    return {
      avgRating,
      avgResponseTime,
      completionRate: Math.round(completionRate)
    };
  } catch (error) {
    console.error('Error in getHostStatistics:', error);
    // Return default values in case of error
    return {
      avgRating: 0,
      avgResponseTime: 6,
      completionRate: 0
    };
  }
}

/**
 * Get host with ranking information
 * @param {number} hostId - ID of the host
 * @returns {object} Host object with ranking information
 */
async function getHostWithRanking(hostId) {
  try {
    const stats = await getHostStatistics(hostId);
    const ranking = calculateHostRanking(stats.avgRating, stats.avgResponseTime, stats.completionRate);
    
    // Get the host details
    const hostResult = await query(`
      SELECT h.*, u.name as user_name
      FROM hosts h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.id = $1
    `, [hostId]);
    
    if (hostResult.rows.length === 0) {
      return null;
    }
    
    const host = hostResult.rows[0];
    
    return {
      ...host,
      rankingScore: ranking.rankingScore,
      rankingBadge: ranking.rankingBadge,
      avgRating: stats.avgRating,
      avgResponseTime: stats.avgResponseTime,
      completionRate: stats.completionRate
    };
  } catch (error) {
    console.error('Error in getHostWithRanking:', error);
    throw error;
  }
}

/**
 * Get all hosts with ranking information
 * @returns {array} Array of hosts with ranking information
 */
async function getAllHostsWithRanking() {
  try {
    const hostsResult = await query(`
      SELECT h.*, u.name as user_name
      FROM hosts h
      LEFT JOIN users u ON h.user_id = u.id
      ORDER BY h.created_at DESC
    `);
    
    const hosts = [];
    
    for (const hostRow of hostsResult.rows) {
      const stats = await getHostStatistics(hostRow.id);
      const ranking = calculateHostRanking(stats.avgRating, stats.avgResponseTime, stats.completionRate);
      
      hosts.push({
        ...hostRow,
        rankingScore: ranking.rankingScore,
        rankingBadge: ranking.rankingBadge,
        avgRating: stats.avgRating,
        avgResponseTime: stats.avgResponseTime,
        completionRate: stats.completionRate
      });
    }
    
    // Sort by ranking score descending
    hosts.sort((a, b) => b.rankingScore - a.rankingScore);
    
    return hosts;
  } catch (error) {
    console.error('Error in getAllHostsWithRanking:', error);
    throw error;
  }
}

module.exports = {
  calculateHostRanking,
  getHostStatistics,
  getHostWithRanking,
  getAllHostsWithRanking
};