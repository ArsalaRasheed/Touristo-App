const { query } = require('../config/database');

/*
|--------------------------------------------------------------------------
| Itinerary endpoints
|--------------------------------------------------------------------------
|
| A "trip" is a booking; the day-by-day itinerary lives on the booked
| package. Returning it here keeps it consistent with what the package
| detail page shows, and access is limited to the traveler who owns the
| booking (or an admin).
|
|--------------------------------------------------------------------------
*/

const getTripItinerary = async (req, res) => {
  try {
    const tripId = req.params.tripId;

    if (!Number.isInteger(Number(tripId))) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid trip id'
      });
    }

    const result = await query(`
      SELECT b.user_id, p.itinerary
      FROM bookings b
      JOIN packages p ON p.id = b.package_id
      WHERE b.id = $1
    `, [Number(tripId)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Trip not found'
      });
    }

    const booking = result.rows[0];
    const isOwner =
      Number(booking.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this itinerary'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        itinerary:
          Array.isArray(booking.itinerary)
            ? booking.itinerary
            : []
      }
    });
  } catch (error) {
    console.error('Error loading itinerary:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = { getTripItinerary };