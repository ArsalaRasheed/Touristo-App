const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');
const Host = require('../models/Host');
const { isAdmin } = require('../middleware/accessControl');
const { query } = require('../config/database');

/**
 * Booking state machine.
 *
 * status:         pending -> confirmed -> completed
 *                 pending/confirmed -> cancelled
 * payment_status: pending -> completed / failed / refunded
 *
 * Only admins may touch payment_status until the payment gateway
 * (Phase 11) owns that transition server-side.
 */
const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * Resolves how the requesting user relates to a booking row:
 * 'traveler' (booked it), 'host' (owns the package's host profile), 'admin'.
 * Returns null when the user has no relationship to the booking.
 */
const getBookingAccess = async (req, booking) => {
  if (isAdmin(req)) return 'admin';

  if (Number(booking.user_id) === Number(req.user.id)) return 'traveler';

  const ownerResult = await query(
    `SELECT h.user_id
       FROM packages p
       JOIN hosts h ON h.id = p.host_id
      WHERE p.id = $1`,
    [booking.package_id]
  ).catch(() => ({ rows: [] }));

  if (
    ownerResult.rows[0] &&
    Number(ownerResult.rows[0].user_id) === Number(req.user.id)
  ) {
    return 'host';
  }

  return null;
};

const bookingController = {
  // Get all bookings (admin only - enforced at the route level)
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
        message: GENERIC_ERROR,
      });
    }
  },

  // Get bookings by user ID (self or admin)
  async getBookingsByUserId(req, res) {
    try {
      const { userId } = req.params;

      if (!isAdmin(req) && Number(req.user.id) !== Number(userId)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to view these bookings',
        });
      }

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
        message: GENERIC_ERROR,
      });
    }
  },

  // Get bookings by host ID (host owner or admin)
  async getBookingsByHostId(req, res) {
    try {
      const { hostId } = req.params;

      if (!isAdmin(req)) {
        const host = await Host.findById(hostId);
        if (!host || Number(host.user_id) !== Number(req.user.id)) {
          return res.status(403).json({
            status: 'fail',
            message: 'You are not authorized to view these bookings',
          });
        }
      }

      // Get packages belonging to this host
      const packages = await Package.findByHostId(hostId);
      const packageIds = packages.map(pkg => pkg.id);

      if (packageIds.length === 0) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: { bookings: [] },
        });
      }

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
        message: GENERIC_ERROR,
      });
    }
  },

  // Get booking by ID (participant or admin)
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

      const access = await getBookingAccess(req, booking);

      if (!access) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to view this booking',
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
        message: GENERIC_ERROR,
      });
    }
  },

  /**
   * Create a booking.
   *
   * Security rules:
   *  - user_id ALWAYS comes from the verified token, never the body.
   *  - status / payment_status are always initialized by the server.
   *  - total_price is computed server-side from the package price.
   */
  async createBooking(req, res) {
    try {
      const { package_id, booking_date, start_date, end_date, travelers } = req.body;
      const user_id = req.user.id;

      if (!package_id || !start_date || !end_date) {
        return res.status(400).json({
          status: 'fail',
          message: 'Package ID, start date and end date are required',
        });
      }

      if (typeof Number(package_id) !== 'number' || Number(package_id) <= 0) {
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

      const sanitizedTravelers = travelers
        ? Math.max(1, Math.min(100, parseInt(travelers, 10) || 1))
        : 1;

      // The package must exist - and pricing always comes from the package.
      const pkg = await Package.findById(Number(package_id));

      if (!pkg) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found',
        });
      }

      const totalPrice = Number(pkg.price) * sanitizedTravelers;

      if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'This package has no valid price configured',
        });
      }

      const newBooking = await Booking.create({
        user_id,
        package_id: Number(package_id),
        booking_date: booking_date || new Date(),
        start_date,
        end_date,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
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
        message: GENERIC_ERROR,
      });
    }
  },

  /**
   * Update booking status / payment status with role-specific rules.
   *
   *  traveler (owner): may cancel their own booking only.
   *  host (package owner): may confirm / complete / cancel bookings on
   *                        their own packages.
   *  admin: full control including payment_status.
   */
  async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const { status, payment_status } = req.body || {};

      const booking = await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          status: 'fail',
          message: 'Booking not found',
        });
      }

      const access = await getBookingAccess(req, booking);

      if (!access) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to update this booking',
        });
      }

      const updates = {};

      if (status !== undefined) {
        if (!BOOKING_STATUSES.includes(status)) {
          return res.status(400).json({
            status: 'fail',
            message: 'Unknown booking status',
          });
        }

        if (access === 'traveler' && status !== 'cancelled') {
          return res.status(403).json({
            status: 'fail',
            message: 'You can only cancel your own booking',
          });
        }

        if (
          (access === 'traveler' || access === 'host') &&
          (booking.status === 'completed' || booking.status === 'cancelled') &&
          status !== booking.status
        ) {
          return res.status(409).json({
            status: 'fail',
            message: `A ${booking.status} booking cannot be changed`,
          });
        }

        updates.status = status;
      }

      if (payment_status !== undefined) {
        if (access !== 'admin') {
          return res.status(403).json({
            status: 'fail',
            message: 'Payment status can only be updated by the platform',
          });
        }

        if (!PAYMENT_STATUSES.includes(payment_status)) {
          return res.status(400).json({
            status: 'fail',
            message: 'Unknown payment status',
          });
        }

        updates.payment_status = payment_status;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'No valid updates supplied',
        });
      }

      const updatedBooking = await Booking.update(id, updates);

      res.status(200).json({
        status: 'success',
        data: { booking: updatedBooking },
      });
    } catch (err) {
      console.error('Error in updateBooking:', err);
      res.status(500).json({
        status: 'error',
        message: GENERIC_ERROR,
      });
    }
  },

  // Delete booking (admin only - enforced at the route level)
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
        message: GENERIC_ERROR,
      });
    }
  },
};

module.exports = bookingController;
