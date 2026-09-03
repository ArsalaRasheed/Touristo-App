const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');

const bookingController = {
  // Get all bookings
  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.findAll();
      res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: { bookings },
      });
    } catch (err) {
      console.error('Error in getAllBookings:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get bookings by user ID
  async getBookingsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const bookings = await Booking.findByUserId(userId);

      res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: { bookings },
      });
    } catch (err) {
      console.error('Error in getBookingsByUserId:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get bookings by host ID
  async getBookingsByHostId(req, res) {
    try {
      const { hostId } = req.params;
      
      // Get packages belonging to this host
      const packages = await Package.findByHostId(hostId);
      const packageIds = packages.map(pkg => pkg.id);
      
      // Get bookings for those packages
      const bookings = await Booking.findByPackageIds(packageIds);
      
      // Add package and user details to bookings
      const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
        const pkg = await Package.findById(booking.package_id);
        const user = await User.findById(booking.user_id);
        
        return {
          ...booking,
          package_title: pkg?.title || 'Unknown Package',
          user_name: user?.name || 'Unknown User'
        };
      }));

      res.status(200).json({
        status: 'success',
        results: bookingsWithDetails.length,
        data: { bookings: bookingsWithDetails },
      });
    } catch (err) {
      console.error('Error in getBookingsByHostId:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get booking by ID
  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          status: 'fail',
          message: 'Booking not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { booking },
      });
    } catch (err) {
      console.error('Error in getBookingById:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new booking
  async createBooking(req, res) {
    try {
      const { user_id, package_id, booking_date, start_date, end_date, total_price, status, payment_status, travelers } = req.body;
      
      // Basic validation
      if (!user_id || !package_id || !start_date || !end_date || !total_price) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID, package ID, start date, end date, and total price are required',
        });
      }

      // Validate data types and formats
      if (typeof user_id !== 'number' || user_id <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID must be a positive integer',
        });
      }

      if (typeof package_id !== 'number' || package_id <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Package ID must be a positive integer',
        });
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          status: 'fail',
          message: 'Start date and end date must be valid dates',
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          status: 'fail',
          message: 'Start date must be before end date',
        });
      }

      // Validate total price
      const totalPrice = parseFloat(total_price);
      if (isNaN(totalPrice) || totalPrice <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Total price must be a positive number',
        });
      }

      // Sanitize optional fields
      const sanitizedStatus = status ? status.trim() : 'pending';
      const sanitizedPaymentStatus = payment_status ? payment_status.trim() : 'pending';
      const sanitizedTravelers = travelers ? Math.max(1, parseInt(travelers)) : 1;

      const newBooking = await Booking.create({ 
        user_id, 
        package_id, 
        booking_date: booking_date || new Date(),
        start_date, 
        end_date, 
        total_price: totalPrice, 
        status: sanitizedStatus, 
        payment_status: sanitizedPaymentStatus, 
        travelers: sanitizedTravelers
      });
      
      res.status(201).json({
        status: 'success',
        data: { booking: newBooking },
      });
    } catch (err) {
      console.error('Error in createBooking:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Update booking
  async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const { status, payment_status } = req.body;

      const updatedBooking = await Booking.update(id, { status, payment_status });

      if (!updatedBooking) {
        return res.status(404).json({
          status: 'fail',
          message: 'Booking not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { booking: updatedBooking },
      });
    } catch (err) {
      console.error('Error in updateBooking:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete booking
  async deleteBooking(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Booking.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Booking not found',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      console.error('Error in deleteBooking:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },
};

module.exports = bookingController;