const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');

// Get homepage data including recommendations
router.get('/homepage-data', generalController.getHomepageData);

module.exports = router;