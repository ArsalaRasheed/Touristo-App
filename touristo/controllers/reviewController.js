const Review = require('../models/Review');

const reviewController = {
  // Get all reviews
  async getAllReviews(req, res) {
    try {
      const reviews = await Review.findAll();
      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews },
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get review by ID
  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { review },
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new review
  async createReview(req, res) {
    try {
      const { user_id, package_id, rating, comment } = req.body;
      
      // Basic validation
      if (!user_id || !package_id || !rating) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID, package ID, and rating are required',
        });
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating must be between 1 and 5',
        });
      }

      const newReview = await Review.create({ user_id, package_id, rating, comment });
      res.status(201).json({
        status: 'success',
        data: { review: newReview },
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Update review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      // Validate rating range if provided
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating must be between 1 and 5',
        });
      }

      const updatedReview = await Review.update(id, { rating, comment });

      if (!updatedReview) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { review: updatedReview },
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Review.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },
};

module.exports = reviewController;