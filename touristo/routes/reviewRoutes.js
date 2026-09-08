const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Get all reviews
router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenticateToken,
    reviewController.createReview
  );

// IMPORTANT:
// This route must come BEFORE /:id
router.get(
  '/user/:userId',
  authenticateToken,
  reviewController.getReviewsByUserId
);

// Get, update and delete a single review
router.route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authenticateToken,
    reviewController.updateReview
  )
  .delete(
    authenticateToken,
    reviewController.deleteReview
  );

module.exports = router;