const express = require('express');
const { getTripItinerary } = require('../controllers/itineraryController');
const { authenticateToken, syncRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/itineraries/trip/:tripId - day-by-day plan for one of my bookings
router.get('/trip/:tripId', authenticateToken, syncRole, getTripItinerary);

module.exports = router;