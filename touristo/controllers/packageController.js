const Package = require('../models/Package');
const { query } = require('../config/database');

const packageController = {
  // Get all packages
  async getAllPackages(req, res) {
    try {
      const packages = await Package.findAll();
      res.status(200).json({
        status: 'success',
        results: packages.length,
        data: { packages },
      });
    } catch (err) {
      console.error('Error in getAllPackages:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get package by ID
  async getPackageById(req, res) {
    try {
      const { id } = req.params;
      const pkg = await Package.findById(id);

      if (!pkg) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found',
        });
      }

      // Get reviews for this package
      const reviewsResult = await query(`
        SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.name as reviewer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE package_id = $1
        ORDER BY created_at DESC
      `, [id]);

      // Calculate average rating
      const ratingsResult = await query(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
        FROM reviews
        WHERE package_id = $1
      `, [id]);

      const avgRating = parseFloat(ratingsResult.rows[0]?.avg_rating) || 0;
      const totalReviews = parseInt(ratingsResult.rows[0]?.total_reviews) || 0;

      // Import and get review summary
      const { generateAndCacheSummary, getCachedSummary } = require('../utils/reviewSummarizer');
      let reviewSummary = null;
      
      try {
        reviewSummary = await getCachedSummary(id);
        if (!reviewSummary) {
          reviewSummary = await generateAndCacheSummary(id);
        }
      } catch (summaryErr) {
        console.error('Error getting review summary:', summaryErr);
        // Don't fail the entire request if summary generation fails
      }

      // Add reviews, rating, and summary to package data
      const packageWithData = {
        ...pkg,
        reviews: reviewsResult.rows,
        avg_rating: avgRating,
        total_reviews: totalReviews,
        group_size: pkg.group_size // Ensure group_size is included in the response
      };

      res.status(200).json({
        status: 'success',
        data: { 
          package: packageWithData,
          reviewSummary: reviewSummary
        },
      });
    } catch (err) {
      console.error('Error in getPackageById:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get packages by host ID
  async getPackagesByHostId(req, res) {
    try {
      const { hostId } = req.params;
      const packages = await Package.findByHostId(hostId);

      // Get booking count for each package
      const packagesWithBookings = await Promise.all(packages.map(async (pkg) => {
        const bookingCountResult = await query(
          'SELECT COUNT(*) as count FROM bookings WHERE package_id = $1',
          [pkg.id]
        );
        return {
          ...pkg,
          booking_count: parseInt(bookingCountResult.rows[0]?.count) || 0
        };
      }));

      res.status(200).json({
        status: 'success',
        results: packagesWithBookings.length,
        data: { packages: packagesWithBookings },
      });
    } catch (err) {
      console.error('Error in getPackagesByHostId:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get packages by destination ID
  async getPackagesByDestinationId(req, res) {
    try {
      const { destinationId } = req.params;
      const packages = await Package.findByDestinationId(destinationId);

      res.status(200).json({
        status: 'success',
        results: packages.length,
        data: { packages },
      });
    } catch (err) {
      console.error('Error in getPackagesByDestinationId:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new package
  async createPackage(req, res) {
    try {
      const { host_id, title, description, price, duration_days, location, inclusions, exclusions, availability_start, availability_end } = req.body;
      
      // Basic validation
      if (!host_id || !title || !price) {
        return res.status(400).json({
          status: 'fail',
          message: 'Host ID, title, and price are required',
        });
      }

      // Validate data types and formats
      if (typeof host_id !== 'number' || host_id <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Host ID must be a positive integer',
        });
      }

      // Validate title
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Title must be a non-empty string',
        });
      }

      // Sanitize title
      const sanitizedTitle = title.trim();

      // Validate price
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Price must be a valid non-negative number',
        });
      }

      // Validate duration if provided
      let sanitizedDuration = duration_days;
      if (duration_days !== undefined) {
        sanitizedDuration = parseInt(duration_days);
        if (isNaN(sanitizedDuration) || sanitizedDuration <= 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'Duration must be a positive integer',
          });
        }
      }

      // Sanitize description if provided
      let sanitizedDescription = description;
      if (description && typeof description === 'string') {
        sanitizedDescription = description.trim().substring(0, 1000); // Limit to 1000 chars
      }

      // Sanitize location if provided
      let sanitizedLocation = location;
      if (location && typeof location === 'string') {
        sanitizedLocation = location.trim();
      }

      // Sanitize inclusions if provided
      let sanitizedInclusions = inclusions;
      if (inclusions && Array.isArray(inclusions)) {
        sanitizedInclusions = inclusions.map(item => 
          typeof item === 'string' ? item.trim() : item
        ).filter(item => item && item.length > 0);
      } else if (inclusions) {
        sanitizedInclusions = [];
      }

      // Sanitize exclusions if provided
      let sanitizedExclusions = exclusions;
      if (exclusions && Array.isArray(exclusions)) {
        sanitizedExclusions = exclusions.map(item => 
          typeof item === 'string' ? item.trim() : item
        ).filter(item => item && item.length > 0);
      } else if (exclusions) {
        sanitizedExclusions = [];
      }

      const newPackage = await Package.create({ 
        host_id, 
        title: sanitizedTitle, 
        description: sanitizedDescription, 
        price: parsedPrice, 
        duration_days: sanitizedDuration, 
        location: sanitizedLocation,
        inclusions: sanitizedInclusions, 
        exclusions: sanitizedExclusions, 
        availability_start, 
        availability_end 
      });
      
      res.status(201).json({
        status: 'success',
        data: { package: newPackage },
      });
    } catch (err) {
      console.error('Error in createPackage:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Update package
  async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const { title, description, price, duration_days, location, inclusions, exclusions, availability_start, availability_end } = req.body;

      const updatedPackage = await Package.update(id, { 
        title, description, price, duration_days, location, 
        inclusions, exclusions, availability_start, availability_end 
      });

      if (!updatedPackage) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { package: updatedPackage },
      });
    } catch (err) {
      console.error('Error in updatePackage:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete package
  async deletePackage(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Package.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      console.error('Error in deletePackage:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },
};

module.exports = packageController;