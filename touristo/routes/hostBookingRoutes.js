const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, syncRole } = require('../middleware/auth');

// Get bookings by host ID (host owner or admin - enforced in the controller)
router.get('/host/:hostId', authenticateToken, syncRole, bookingController.getBookingsByHostId);

module.exports = router;