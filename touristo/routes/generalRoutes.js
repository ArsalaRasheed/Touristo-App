const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');
const { optionalAuth } = require('../middleware/auth');

// Get homepage data including recommendations
// (personalised only when the caller is authenticated)
router.get('/homepage-data', optionalAuth, generalController.getHomepageData);

module.exports = router;