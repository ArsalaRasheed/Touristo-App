const Review = require('../models/Review');
const Booking = require('../models/Booking');

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
      console.error('Error fetching reviews:', err);

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get reviews written by a specific user
  async getReviewsByUserId(req, res) {
    try {
      const requestedUserId = Number(req.params.userId);

      if (!Number.isInteger(requestedUserId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid user ID',
        });
      }

      // Users can only access their own reviews
      if (Number(req.user.id) !== requestedUserId) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only access your own reviews',
        });
      }

      const reviews = await Review.findByUserId(requestedUserId);

      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews },
      });
    } catch (err) {
      console.error('Error fetching user reviews:', err);

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
      console.error('Error fetching review:', err);

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new review
  async createReview(req, res) {
    try {
      const userId = Number(req.user.id);
      const { package_id, rating, comment } = req.body;

      if (!package_id || rating === undefined || rating === null) {
        return res.status(400).json({
          status: 'fail',
          message: 'Package ID and rating are required',
        });
      }

      const numericPackageId = Number(package_id);
      const numericRating = Number(rating);

      if (!Number.isInteger(numericPackageId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid package ID',
        });
      }

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating must be between 1 and 5',
        });
      }

      // Check whether the traveler actually booked this package
      const bookings = await Booking.findByUserId(userId);

      const completedBooking = bookings.find((booking) => {
        if (Number(booking.package_id) !== numericPackageId) {
          return false;
        }

        const status = String(booking.status || '').toLowerCase();

        if (
          status === 'cancelled' ||
          status === 'canceled' ||
          status === 'rejected' ||
          status === 'declined'
        ) {
          return false;
        }

        if (!booking.end_date) {
          return false;
        }

        return new Date(booking.end_date) <= new Date();
      });

      if (!completedBooking) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only review a package after completing your trip',
        });
      }

      // Prevent duplicate reviews for the same package
      const existingReviews = await Review.findByUserId(userId);

      const alreadyReviewed = existingReviews.some(
        (review) => Number(review.package_id) === numericPackageId
      );

      if (alreadyReviewed) {
        return res.status(409).json({
          status: 'fail',
          message: 'You have already reviewed this package',
        });
      }

      const cleanComment =
        typeof comment === 'string' ? comment.trim() : '';

      const newReview = await Review.create({
        user_id: userId,
        package_id: numericPackageId,
        rating: numericRating,
        comment: cleanComment || null,
      });

      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully',
        data: { review: newReview },
      });
    } catch (err) {
      console.error('Error creating review:', err);

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

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      // Only the review owner can edit it
      if (Number(review.user_id) !== Number(req.user.id)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only edit your own reviews',
        });
      }

      if (rating !== undefined && rating !== null) {
        const numericRating = Number(rating);

        if (
          !Number.isInteger(numericRating) ||
          numericRating < 1 ||
          numericRating > 5
        ) {
          return res.status(400).json({
            status: 'fail',
            message: 'Rating must be between 1 and 5',
          });
        }
      }

      const cleanComment =
        typeof comment === 'string' ? comment.trim() : '';

      const updatedReview = await Review.update(id, {
        rating:
          rating !== undefined && rating !== null
            ? Number(rating)
            : review.rating,
        comment: cleanComment || null,
      });

      res.status(200).json({
        status: 'success',
        message: 'Review updated successfully',
        data: { review: updatedReview },
      });
    } catch (err) {
      console.error('Error updating review:', err);

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

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      // Only the review owner can delete it
      if (Number(review.user_id) !== Number(req.user.id)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only delete your own reviews',
        });
      }

      const deleted = await Review.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting review:', err);

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },
};

module.exports = reviewController;