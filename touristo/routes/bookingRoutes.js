const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Get all bookings
router.get('/', bookingController.getAllBookings);

// Get bookings by user ID
router.get('/user/:userId', bookingController.getBookingsByUserId);

// Get bookings by host ID
router.get('/host/:hostId', bookingController.getBookingsByHostId);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Create a new booking
router.post('/', bookingController.createBooking);

// Update booking
router.put('/:id', bookingController.updateBooking);

// Delete booking
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;