const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Get weather by coordinates
router.get('/coordinates', weatherController.getWeatherByCoordinates);

module.exports = router;