const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, requireRole, syncRole } = require('../middleware/auth');

// Get all bookings (admin only)
router.get('/', authenticateToken, requireRole('admin'), bookingController.getAllBookings);

// Get bookings by user ID (self or admin)
router.get('/user/:userId', authenticateToken, syncRole, bookingController.getBookingsByUserId);

// Get bookings by host ID (host owner or admin)
router.get('/host/:hostId', authenticateToken, syncRole, bookingController.getBookingsByHostId);

// Get booking by ID (participant or admin)
router.get('/:id', authenticateToken, syncRole, bookingController.getBookingById);

// Create a new booking (authenticated traveler only)
router.post('/', authenticateToken, syncRole, bookingController.createBooking);

// Update booking (traveler/host/admin with role-specific rules)
router.put('/:id', authenticateToken, syncRole, bookingController.updateBooking);

// Delete booking (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), bookingController.deleteBooking);

module.exports = router;
