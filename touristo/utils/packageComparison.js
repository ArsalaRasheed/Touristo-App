/**
 * Compare packages and determine the best value/match
 * @param {Array} packages - Array of package objects
 * @returns {Array} Array of packages with comparison badges
 */
function comparePackages(packages) {
  // Handle edge cases
  if (!packages || !Array.isArray(packages) || packages.length < 2) {
    // If there are less than 2 packages, return them without comparison badges
    return (packages || []).map(pkg => ({
      ...pkg,
      comparisonBadge: null
    }));
  }

  // Filter out invalid packages and get valid prices
  const validPackages = packages.filter(pkg => 
    pkg && 
    typeof pkg === 'object' && 
    typeof pkg.price !== 'undefined' && 
    pkg.price !== null
  );
  
  if (validPackages.length === 0) {
    return packages.map(pkg => ({
      ...pkg,
      comparisonBadge: null
    }));
  }
  
  // Calculate average price using valid packages
  const totalPrice = validPackages.reduce((sum, pkg) => {
    const price = parseFloat(pkg.price) || 0;
    return sum + price;
  }, 0);
  const avgPrice = totalPrice / validPackages.length;
  
  // Filter packages with valid ratings
  const validRatedPackages = packages.filter(pkg => 
    pkg && 
    typeof pkg === 'object' && 
    typeof pkg.rating !== 'undefined' && 
    pkg.rating !== null
  );
  
  // Calculate average rating
  const totalRating = validRatedPackages.reduce((sum, pkg) => {
    const rating = parseFloat(pkg.rating) || 0;
    return sum + rating;
  }, 0);
  const avgRating = validRatedPackages.length > 0 ? totalRating / validRatedPackages.length : 0;

  // Determine best value and top match for each package
  return packages.map(pkg => {
    if (!pkg || typeof pkg !== 'object') {
      return {
        ...pkg,
        comparisonBadge: null
      };
    }
    
    const price = parseFloat(pkg.price) || 0;
    const rating = parseFloat(pkg.rating) || 0;
    
    // Calculate value score (higher rating and lower price = better value)
    // Normalize rating to 0-1 scale and price to favor lower prices
    const normalizedRating = rating / 5; // Assuming rating is out of 5
    
    // Avoid division by zero when avgPrice is 0
    const priceEfficiency = avgPrice > 0 ? avgPrice / Math.max(price, 1) : 0;
    
    const valueScore = (normalizedRating * 0.6) + (priceEfficiency * 0.4);
    
    // Determine badges based on comparison
    let comparisonBadge = null;
    
    // Best Value: Good rating at a reasonable price
    if (rating >= avgRating && price <= avgPrice * 1.1 && valueScore > 0.7) {
      comparisonBadge = 'Best Value';
    }
    // Top Match: High rating regardless of price
    else if (rating >= avgRating * 1.1 && rating >= 4.0) {
      comparisonBadge = 'Top Match';
    }
    
    return {
      ...pkg,
      comparisonBadge
    };
  });
}

module.exports = {
  comparePackages
};