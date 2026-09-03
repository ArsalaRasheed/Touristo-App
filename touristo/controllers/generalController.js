const Package = require('../models/Package');
const { getPersonalizedRecommendations } = require('../utils/recommendations');

const generalController = {
  // Get homepage data including personalized recommendations
  async getHomepageData(req, res) {
    try {
      // Get user ID from request (would come from auth middleware in real implementation)
      const userId = req.query.userId || null;
      
      // Get personalized recommendations if user ID is provided
      let recommendedPackages = [];
      try {
        if (userId) {
          recommendedPackages = await getPersonalizedRecommendations(parseInt(userId));
        } else {
          // If no user ID, get trending packages
          recommendedPackages = await getPersonalizedRecommendations(null);
        }
      } catch (recError) {
        console.error('Error getting recommendations:', recError);
        // Fallback to trending packages if recommendation fails
        recommendedPackages = await getPersonalizedRecommendations(null);
      }
      
      // Get some popular destinations (top-level packages grouped by destination)
      let popularDestinationsResult = [];
      try {
        popularDestinationsResult = await Package.findAll();
      } catch (pkgError) {
        console.error('Error getting packages for destinations:', pkgError);
        popularDestinationsResult = [];
      }
      
      const destinationsMap = {};
      
      popularDestinationsResult.forEach(pkg => {
        if (pkg && pkg.destination) {
          if (!destinationsMap[pkg.destination]) {
            destinationsMap[pkg.destination] = {
              name: pkg.destination,
              packageCount: 0,
              packages: []
            };
          }
          destinationsMap[pkg.destination].packageCount++;
          if (destinationsMap[pkg.destination].packages.length < 3) {
            destinationsMap[pkg.destination].packages.push(pkg);
          }
        }
      });
      
      const popularDestinations = Object.values(destinationsMap).slice(0, 5);
      
      // Add comparison badges to recommended packages to match live site
      const recommendedPackagesWithBadges = (recommendedPackages || []).slice(0, 4).map((pkg, index) => ({
        ...pkg,
        comparisonBadge: index === 0 ? 'Top Match' : null // Add top match badge to first package
      }));
      
      // Add comparison badges to featured packages to match live site
      const featuredPackagesWithBadges = (popularDestinationsResult || []).slice(0, 6).map((pkg, index) => ({
        ...pkg,
        comparisonBadge: index < 2 ? (index === 0 ? 'Top Match' : 'Best Value') : null // Add badges to top 2 packages
      }));
      
      res.status(200).json({
        status: 'success',
        data: {
          recommendedPackages: recommendedPackagesWithBadges,
          popularDestinations,
          featuredPackages: featuredPackagesWithBadges
        }
      });
    } catch (err) {
      console.error('Error in getHomepageData:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  }
};

module.exports = generalController;