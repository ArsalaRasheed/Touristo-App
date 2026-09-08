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
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get reviews written by a specific user
  async getReviewsByUserId(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID is required',
        });
      }

      if (Number(req.user.id) !== Number(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only view your own reviews',
        });
      }

      const reviews = await Review.findByUserId(userId);

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
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create review
  async createReview(req, res) {
    try {
      const userId = req.user.id;
      const { package_id, rating, comment } = req.body;

      if (!package_id || !rating) {
        return res.status(400).json({
          status: 'fail',
          message: 'Package ID and rating are required',
        });
      }

      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating must be an integer between 1 and 5',
        });
      }

      // Check whether user actually booked this package
      const bookings = await Booking.findByUserId(userId);

      const cancelledStatuses = [
        'cancelled',
        'canceled',
        'rejected',
        'declined',
      ];

      const completedBooking = bookings.find((booking) => {
        const status = String(booking.status || '').toLowerCase();

        if (cancelledStatuses.includes(status)) {
          return false;
        }

        if (Number(booking.package_id) !== Number(package_id)) {
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
          message:
            'You can only review packages from completed trips',
        });
      }

      // Prevent duplicate review
      const existingReviews = await Review.findByUserId(userId);

      const alreadyReviewed = existingReviews.some(
        (review) =>
          Number(review.package_id) === Number(package_id)
      );

      if (alreadyReviewed) {
        return res.status(409).json({
          status: 'fail',
          message:
            'You have already reviewed this package',
        });
      }

      const newReview = await Review.create({
        user_id: userId,
        package_id: Number(package_id),
        rating: numericRating,
        comment: comment ? comment.trim() : null,
      });

      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully',
        data: {
          review: newReview,
        },
      });
    } catch (err) {
      console.error('Error creating review:', err);

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Update own review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const existingReview = await Review.findById(id);

      if (!existingReview) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      if (Number(existingReview.user_id) !== Number(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only edit your own review',
        });
      }

      if (
        rating !== undefined &&
        (
          !Number.isInteger(Number(rating)) ||
          Number(rating) < 1 ||
          Number(rating) > 5
        )
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating must be an integer between 1 and 5',
        });
      }

      const updatedReview = await Review.update(id, {
        rating:
          rating !== undefined
            ? Number(rating)
            : existingReview.rating,
        comment:
          comment !== undefined
            ? comment.trim()
            : existingReview.comment,
      });

      res.status(200).json({
        status: 'success',
        message: 'Review updated successfully',
        data: {
          review: updatedReview,
        },
      });
    } catch (err) {
      console.error('Error updating review:', err);

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete own review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingReview = await Review.findById(id);

      if (!existingReview) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found',
        });
      }

      if (Number(existingReview.user_id) !== Number(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only delete your own review',
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