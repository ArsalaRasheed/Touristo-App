const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Get bookings by host ID
router.get('/host/:hostId', bookingController.getBookingsByHostId);

module.exports = router;