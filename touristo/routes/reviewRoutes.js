const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// All reviews
router.get('/', reviewController.getAllReviews);

// Reviews belonging to logged-in user
// Keep this BEFORE /:id
router.get(
  '/user/:userId',
  authenticateToken,
  reviewController.getReviewsByUserId
);

// Create review
router.post(
  '/',
  authenticateToken,
  reviewController.createReview
);

// Get, update and delete individual review
router.get('/:id', reviewController.getReviewById);

router.patch(
  '/:id',
  authenticateToken,
  reviewController.updateReview
);

router.delete(
  '/:id',
  authenticateToken,
  reviewController.deleteReview
);

module.exports = router;