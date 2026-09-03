const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Define routes for reviews
router.route('/')
  .get(reviewController.getAllReviews)
  .post(authenticateToken, reviewController.createReview);

router.route('/:id')
  .get(reviewController.getReviewById)
  .patch(authenticateToken, reviewController.updateReview)
  .delete(authenticateToken, reviewController.deleteReview);

module.exports = router;