const {
  query
} = require('../config/database');

const VALID_STATUSES =
  new Set([
    'Pending',
    'Sent',
    'Delivered',
    'Failed'
  ]);

const sanitizeStatus =
  value =>
    VALID_STATUSES.has(value)
      ? value
      : 'Pending';

const buildAlert =
  row => ({
    id: row.id,
    user_id: row.user_id,
    trip_id: row.trip_id,
    lat: Number(row.lat),
    lng: Number(row.lng),
    accuracy:
      row.accuracy === null ||
      row.accuracy === undefined
        ? null
        : Number(row.accuracy),
    message: row.message,
    status: sanitizeStatus(row.status),
    created_at: row.created_at,
    updated_at: row.updated_at,
    acknowledged_at: row.acknowledged_at
  });

const sosController = {

  /*
  |--------------------------------------------------------------------------
  | CREATE SOS ALERT
  |--------------------------------------------------------------------------
  | Stores the alert server-side. "Sent" here strictly means the server has
  | received it — it does NOT mean a human has seen it. "Delivered" is only
  | reached via the explicit acknowledge endpoint below.
  */

  async createSosAlert(req, res) {
    try {
      const {
        trip_id,
        lat,
        lng,
        accuracy,
        message
      } = req.body || {};

      const latitude = Number(lat);
      const longitude = Number(lng);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'Valid latitude and longitude are required'
        });
      }

      const parsedTripId =
        trip_id === undefined ||
        trip_id === null ||
        trip_id === ''
          ? null
          : Number(trip_id);

      if (
        parsedTripId !== null &&
        !Number.isInteger(parsedTripId)
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid trip id'
        });
      }

      // If a trip was supplied, verify the traveler actually owns it.
      if (parsedTripId !== null) {
        const tripResult = await query(
          `
            SELECT id
            FROM bookings
            WHERE id = $1
              AND user_id = $2
          `,
          [parsedTripId, req.user.id]
        );

        if (tripResult.rows.length === 0) {
          return res.status(403).json({
            status: 'fail',
            message: 'You are not authorized to use that trip'
          });
        }
      }

      const parsedAccuracy =
        accuracy === undefined ||
        accuracy === null ||
        accuracy === ''
          ? null
          : Number(accuracy);

      const safeMessage =
        typeof message === 'string'
          ? message.trim().slice(0, 1000)
          : null;

      const result = await query(
        `
          INSERT INTO sos_alerts (
            user_id,
            trip_id,
            lat,
            lng,
            accuracy,
            message,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'Sent')
          RETURNING *
        `,
        [
          req.user.id,
          parsedTripId,
          latitude,
          longitude,
          Number.isFinite(parsedAccuracy)
            ? parsedAccuracy
            : null,
          safeMessage
        ]
      );

      return res.status(201).json({
        status: 'success',
        data: {
          alert: buildAlert(result.rows[0])
        }
      });
    } catch (err) {
      console.error('Error creating SOS alert:', err);
      return res.status(502).json({
        status: 'error',
        message: 'SOS alert could not be delivered to the server'
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | LIST OWN SOS ALERTS
  |--------------------------------------------------------------------------
  */

  async listMySosAlerts(req, res) {
    try {
      const result = await query(
        `
          SELECT *
          FROM sos_alerts
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 100
        `,
        [req.user.id]
      );

      return res.status(200).json({
        status: 'success',
        data: {
          alerts: result.rows.map(buildAlert)
        }
      });
    } catch (err) {
      console.error('Error listing SOS alerts:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Unable to load SOS alerts'
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | ACKNOWLEDGE SOS ALERT
  |--------------------------------------------------------------------------
  | Explicit confirmation that help was reached. Only the alert owner can
  | acknowledge. Never automatically mark an alert as Delivered.
  */

  async acknowledgeSosAlert(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid alert id'
        });
      }

      const existing = await query(
        `
          SELECT id
          FROM sos_alerts
          WHERE id = $1
            AND user_id = $2
        `,
        [id, req.user.id]
      );

      if (existing.rows.length === 0) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to acknowledge this alert'
        });
      }

      const result = await query(
        `
          UPDATE sos_alerts
          SET status = 'Delivered',
              acknowledged_at = NOW(),
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [id]
      );

      return res.status(200).json({
        status: 'success',
        data: {
          alert: buildAlert(result.rows[0])
        }
      });
    } catch (err) {
      console.error('Error acknowledging SOS alert:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Unable to acknowledge SOS alert'
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | CLEAR FAILED ALERTS (LOCAL QUEUE CLEANUP)
  |--------------------------------------------------------------------------
  */

  async clearSosAlert(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid alert id'
        });
      }

      const result = await query(
        `
          DELETE FROM sos_alerts
          WHERE id = $1
            AND user_id = $2
          RETURNING id
        `,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to delete this alert'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'SOS alert removed'
      });
    } catch (err) {
      console.error('Error deleting SOS alert:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Unable to delete SOS alert'
      });
    }
  }
};

module.exports = sosController;