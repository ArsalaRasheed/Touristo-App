const { query, withTransaction } = require('../config/database');

const USER_ROLES = ['traveler', 'host', 'admin'];
const HOST_VERIFICATION_STATES = ['pending', 'verified', 'rejected'];
const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const REPORT_TARGET_TYPES = ['review', 'package', 'user', 'host'];
const REPORT_STATUSES = ['open', 'resolved', 'dismissed'];

const cleanFilter = (value, maxLength = 80) =>
  typeof value === 'string' ? value.trim().substring(0, maxLength) : '';

const parsePagination = (source = {}) => {
  const page = Math.max(1, parseInt(source.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(source.limit, 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
};

const toPositiveInt = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/*
 * Best-effort audit trail. Never throws - a failed audit write must
 * not roll back the admin action it describes (the action itself is
 * already authenticated and validated).
 */
const logAdminAction = (req, action, targetType, targetId, details = {}) => {
  const actorId = toPositiveInt(req.user?.id, null);
  const actorEmail =
    typeof req.user?.email === 'string' ? req.user.email : null;

  query(
    `
      INSERT INTO admin_audit_log
        (actor_id, actor_email, action, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      actorId === null ? null : actorId,
      actorEmail,
      action,
      targetType,
      targetId,
      JSON.stringify(details)
    ]
  ).catch(err => {
    console.error('Audit log write failed:', err.message);
  });
};

const adminController = {
  // Admin dashboard overview
  async getDashboardOverview(req, res) {
    try {
      const result = await query(`
        SELECT
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'traveler') AS total_travelers,
          (SELECT COUNT(*) FROM users WHERE role = 'host') AS total_hosts,
          (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
          (SELECT COUNT(*) FROM hosts WHERE verification_status = 'pending') AS pending_host_verifications,
          (SELECT COUNT(*) FROM packages) AS total_packages,
          (SELECT COUNT(*) FROM bookings) AS total_bookings,
          (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completed_bookings,
          (SELECT COUNT(*) FROM reports WHERE status = 'open') AS open_reports
      `);

      const stats = result.rows[0];

      res.status(200).json({
        status: 'success',
        data: {
          overview: {
            totalUsers: parseInt(stats.total_users) || 0,
            totalTravelers: parseInt(stats.total_travelers) || 0,
            totalHosts: parseInt(stats.total_hosts) || 0,
            totalAdmins: parseInt(stats.total_admins) || 0,
            pendingHostVerifications:
              parseInt(stats.pending_host_verifications) || 0,
            totalPackages: parseInt(stats.total_packages) || 0,
            totalBookings: parseInt(stats.total_bookings) || 0,
            completedBookings: parseInt(stats.completed_bookings) || 0,
            openReports: parseInt(stats.open_reports) || 0
          }
        }
      });
    } catch (err) {
      console.error('Error in getDashboardOverview:', err);

      res.status(500).json({
        status: 'error',
        message: 'Failed to load admin dashboard overview'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* USERS                                                              */
  /* ------------------------------------------------------------------ */

  async getUsers(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const search = cleanFilter(req.query.q);
      const role = cleanFilter(req.query.role);

      if (role && !USER_ROLES.includes(role)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Unknown role filter'
        });
      }

      const pattern = `%${search}%`;

      const countResult = await query(
        `
          SELECT COUNT(*)::int AS total
          FROM users u
          WHERE ($1 = '' OR u.name ILIKE $2 OR u.email ILIKE $2)
            AND ($3 = '' OR u.role = $3)
        `,
        [search, pattern, role]
      );

      const result = await query(
        `
          SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.role,
            u.created_at,
            h.id AS host_id,
            h.company_name,
            h.verification_status,
            (
              SELECT COUNT(*)::int
              FROM bookings b
              WHERE b.user_id = u.id
            ) AS booking_count,
            (
              SELECT COUNT(*)::int
              FROM reviews r
              WHERE r.user_id = u.id
            ) AS review_count
          FROM users u
          LEFT JOIN hosts h ON h.user_id = u.id
          WHERE ($1 = '' OR u.name ILIKE $2 OR u.email ILIKE $2)
            AND ($3 = '' OR u.role = $3)
          ORDER BY u.created_at DESC
          LIMIT $4 OFFSET $5
        `,
        [search, pattern, role, limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          users: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getUsers:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load users'
      });
    }
  },

  async updateUserRole(req, res) {
    try {
      const id = toPositiveInt(req.params.id, -1);
      const role = cleanFilter(req.body?.role);

      if (id < 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid user id'
        });
      }

      if (!USER_ROLES.includes(role)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Role must be traveler, host or admin'
        });
      }

      if (Number(req.user?.id) === id && role !== 'admin') {
        return res.status(400).json({
          status: 'fail',
          message: 'You cannot change your own role'
        });
      }

      const current = await query(
        'SELECT id, role FROM users WHERE id = $1',
        [id]
      );

      if (!current.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }

      if (current.rows[0].role === 'admin' && role !== 'admin') {
        const admins = await query(
          `SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin'`
        );

        if (admins.rows[0].total <= 1) {
          return res.status(400).json({
            status: 'fail',
            message: 'At least one admin must remain'
          });
        }
      }

      const updated = await query(
        `
          UPDATE users
          SET role = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id, name, email, role
        `,
        [role, id]
      );

      logAdminAction(req, 'user.role_changed', 'user', id, {
        from: current.rows[0].role,
        to: role,
        email: current.rows[0].email
      });

      res.status(200).json({
        status: 'success',
        data: { user: updated.rows[0] }
      });
    } catch (err) {
      console.error('Error in updateUserRole:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user role'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* HOSTS AND VERIFICATION                                             */
  /* ------------------------------------------------------------------ */

  async getHosts(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const search = cleanFilter(req.query.q);
      const verification = cleanFilter(req.query.verification);

      if (verification && !HOST_VERIFICATION_STATES.includes(verification)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Unknown verification filter'
        });
      }

      const pattern = `%${search}%`;

      const countResult = await query(
        `
          SELECT COUNT(*)::int AS total
          FROM hosts h
          LEFT JOIN users u ON u.id = h.user_id
          WHERE ($1 = '' OR h.company_name ILIKE $2
                    OR u.name ILIKE $2 OR u.email ILIKE $2)
            AND ($3 = '' OR h.verification_status = $3)
        `,
        [search, pattern, verification]
      );

      const result = await query(
        `
          SELECT
            h.id,
            h.user_id,
            h.company_name,
            h.description,
            h.location,
            h.license_number,
            h.cnic_or_business_registration,
            h.company_address,
            h.verification_status,
            h.verified,
            h.rating,
            h.rating_score,
            h.created_at,
            u.name AS owner_name,
            u.email AS owner_email,
            u.phone AS owner_phone,
            (
              SELECT COUNT(*)::int
              FROM packages p
              WHERE p.host_id = h.id
            ) AS package_count,
            (
              SELECT COUNT(*)::int
              FROM bookings b
              JOIN packages p ON p.id = b.package_id
              WHERE p.host_id = h.id
            ) AS booking_count
          FROM hosts h
          LEFT JOIN users u ON u.id = h.user_id
          WHERE ($1 = '' OR h.company_name ILIKE $2
                    OR u.name ILIKE $2 OR u.email ILIKE $2)
            AND ($3 = '' OR h.verification_status = $3)
          ORDER BY h.created_at DESC
          LIMIT $4 OFFSET $5
        `,
        [search, pattern, verification, limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          hosts: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getHosts:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load hosts'
      });
    }
  },

  async updateHostVerification(req, res) {
    try {
      const id = toPositiveInt(req.params.id, -1);
      const status = cleanFilter(req.body?.status);

      if (!HOST_VERIFICATION_STATES.includes(status)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Status must be pending, verified or rejected'
        });
      }

      const previous = await query(
        'SELECT verification_status FROM hosts WHERE id = $1',
        [id]
      );

      if (!previous.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found'
        });
      }

      const updated = await query(
        `
          UPDATE hosts
          SET verification_status = $1,
              verified = $2,
              updated_at = NOW()
          WHERE id = $3
          RETURNING id, company_name, verification_status, verified
        `,
        [status, status === 'verified', id]
      );

      if (!updated.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found'
        });
      }

      logAdminAction(
        req,
        'host.verification_changed',
        'host',
        id,
        {
          from: previous.rows[0].verification_status,
          to: status,
          company_name: updated.rows[0]?.company_name
        }
      );

      res.status(200).json({
        status: 'success',
        data: { host: updated.rows[0] }
      });
    } catch (err) {
      console.error('Error in updateHostVerification:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update verification status'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* PACKAGES                                                           */
  /* ------------------------------------------------------------------ */

  async getPackages(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const search = cleanFilter(req.query.q);
      const pattern = `%${search}%`;

      const countResult = await query(
        `
          SELECT COUNT(*)::int AS total
          FROM packages p
          WHERE ($1 = '' OR p.title ILIKE $2 OR p.destination ILIKE $2)
        `,
        [search, pattern]
      );

      const result = await query(
        `
          SELECT
            p.id,
            p.title,
            p.destination,
            p.price,
            p.duration_days,
            p.created_at,
            p.image,
            h.id AS host_id,
            h.company_name,
            h.verification_status AS host_verification_status,
            (
              SELECT COUNT(*)::int
              FROM bookings b
              WHERE b.package_id = p.id
            ) AS booking_count,
            (
              SELECT COUNT(*)::int
              FROM reviews r
              WHERE r.package_id = p.id
            ) AS review_count
          FROM packages p
          JOIN hosts h ON h.id = p.host_id
          WHERE ($1 = '' OR p.title ILIKE $2 OR p.destination ILIKE $2)
          ORDER BY p.created_at DESC
          LIMIT $3 OFFSET $4
        `,
        [search, pattern, limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          packages: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getPackages:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load packages'
      });
    }
  },

  async deletePackage(req, res) {
    try {
      const id = toPositiveInt(req.params.id, -1);

      const summary = await withTransaction(async client => {
        const existing = await client.query(
          'SELECT id FROM packages WHERE id = $1 FOR UPDATE',
          [id]
        );

        if (!existing.rows.length) {
          return null;
        }

        const reviews = await client.query(
          'DELETE FROM reviews WHERE package_id = $1',
          [id]
        );

        const summaries = await client.query(
          'DELETE FROM review_summaries WHERE package_id = $1',
          [id]
        );

        const bookings = await client.query(
          'DELETE FROM bookings WHERE package_id = $1',
          [id]
        );

        await client.query(
          'DELETE FROM packages WHERE id = $1',
          [id]
        );

        return {
          reviewsRemoved: reviews.rowCount,
          summariesRemoved: summaries.rowCount,
          bookingsRemoved: bookings.rowCount
        };
      });

      if (!summary) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found'
        });
      }

      logAdminAction(req, 'package.deleted', 'package', id, summary);

      res.status(200).json({
        status: 'success',
        data: {
          message: 'Package removed from the marketplace',
          ...summary
        }
      });
    } catch (err) {
      console.error('Error in admin deletePackage:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to remove the package'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* BOOKINGS                                                           */
  /* ------------------------------------------------------------------ */

  async getBookings(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const status = cleanFilter(req.query.status);
      const search = cleanFilter(req.query.q);
      const pattern = `%${search}%`;

      if (status && !BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Unknown booking status filter'
        });
      }

      const countResult = await query(
        `
          SELECT COUNT(*)::int AS total
          FROM bookings b
          JOIN users u ON u.id = b.user_id
          JOIN packages p ON p.id = b.package_id
          WHERE ($1 = '' OR b.status = $1)
            AND (
              $2 = ''
              OR u.name ILIKE $3
              OR u.email ILIKE $3
              OR p.title ILIKE $3
            )
        `,
        [status, search, pattern]
      );

      const result = await query(
        `
          SELECT
            b.id,
            b.booking_date,
            b.travel_date,
            b.total_price,
            b.status,
            b.payment_status,
            b.travelers,
            b.created_at,
            u.id AS traveler_id,
            u.name AS traveler_name,
            u.email AS traveler_email,
            p.id AS package_id,
            p.title AS package_title,
            p.destination,
            h.company_name
          FROM bookings b
          JOIN users u ON u.id = b.user_id
          JOIN packages p ON p.id = b.package_id
          JOIN hosts h ON h.id = p.host_id
          WHERE ($1 = '' OR b.status = $1)
            AND (
              $2 = ''
              OR u.name ILIKE $3
              OR u.email ILIKE $3
              OR p.title ILIKE $3
            )
          ORDER BY b.created_at DESC
          LIMIT $4 OFFSET $5
        `,
        [status, search, pattern, limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          bookings: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getBookings:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load bookings'
      });
    }
  },

  async updateBookingStatus(req, res) {
    try {
      const id = toPositiveInt(req.params.id, -1);
      const status = cleanFilter(req.body?.status);

      if (!BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Status must be pending, confirmed, completed or cancelled'
        });
      }

      const previous = await query(
        'SELECT status FROM bookings WHERE id = $1',
        [id]
      );

      if (!previous.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Booking not found'
        });
      }

      const updated = await query(
        `
          UPDATE bookings
          SET status = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id, status, payment_status, total_price
        `,
        [status, id]
      );

      if (!updated.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Booking not found'
        });
      }

      logAdminAction(req, 'booking.status_changed', 'booking', id, {
        from: previous.rows[0].status,
        to: status
      });

      res.status(200).json({
        status: 'success',
        data: { booking: updated.rows[0] }
      });
    } catch (err) {
      console.error('Error in updateBookingStatus:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update booking status'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* REVIEWS                                                            */
  /* ------------------------------------------------------------------ */

  async getReviews(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const rating = cleanFilter(req.query.rating);
      const pattern = `%${cleanFilter(req.query.q)}%`;
      const search = cleanFilter(req.query.q);

      if (rating && !['1', '2', '3', '4', '5'].includes(rating)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating filter must be between 1 and 5'
        });
      }

      const countResult = await query(
        `
          SELECT COUNT(*)::int AS total
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          JOIN packages p ON p.id = r.package_id
          WHERE ($1 = '' OR r.rating::text = $1)
            AND (
              $2 = ''
              OR u.name ILIKE $3
              OR p.title ILIKE $3
              OR r.comment ILIKE $3
            )
        `,
        [rating, search, pattern]
      );

      const result = await query(
        `
          SELECT
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.id AS traveler_id,
            u.name AS traveler_name,
            u.email AS traveler_email,
            p.id AS package_id,
            p.title AS package_title,
            h.company_name
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          JOIN packages p ON p.id = r.package_id
          JOIN hosts h ON h.id = p.host_id
          WHERE ($1 = '' OR r.rating::text = $1)
            AND (
              $2 = ''
              OR u.name ILIKE $3
              OR p.title ILIKE $3
              OR r.comment ILIKE $3
            )
          ORDER BY r.created_at DESC
          LIMIT $4 OFFSET $5
        `,
        [rating, search, pattern, limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          reviews: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getReviews:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load reviews'
      });
    }
  },

  async deleteReview(req, res) {
    try {
      const id = toPositiveInt(req.params.id, -1);

      const deleted = await query(
        'DELETE FROM reviews WHERE id = $1 RETURNING id',
        [id]
      );

      if (!deleted.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Review not found'
        });
      }

      logAdminAction(req, 'review.deleted', 'review', id);

      res.status(200).json({
        status: 'success',
        data: { message: 'Review removed' }
      });
    } catch (err) {
      console.error('Error in deleteReview:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to remove the review'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* MODERATION - reports                                               */
  /* ------------------------------------------------------------------ */

  async getReports(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const search = cleanFilter(req.query.q);
      const status = cleanFilter(req.query.status);
      const targetType = cleanFilter(req.query.target_type);

      if (status && !REPORT_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Unknown report status filter'
        });
      }

      if (targetType && !REPORT_TARGET_TYPES.includes(targetType)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Unknown report target filter'
        });
      }

      const pattern = `%${search}%`;

      const countResult = await query(
        `
          SELECT COUNT(*)::int AS total
          FROM reports r
          JOIN users u ON u.id = r.reporter_id
          WHERE ($1 = '' OR r.status = $1)
            AND ($2 = '' OR r.target_type = $2)
            AND (
              $3 = ''
              OR u.name ILIKE $4
              OR u.email ILIKE $4
              OR r.reason ILIKE $4
              OR r.details ILIKE $4
            )
        `,
        [status, targetType, search, pattern]
      );

      const result = await query(
        `
          SELECT
            r.id,
            r.reporter_id,
            r.target_type,
            r.target_id,
            r.reason,
            r.details,
            r.status,
            r.resolution_note,
            r.resolved_by,
            r.resolved_at,
            r.created_at,
            u.name AS reporter_name,
            u.email AS reporter_email,
            CASE
              WHEN r.target_type = 'user' THEN tu.name
              WHEN r.target_type = 'package' THEN pk.title
              WHEN r.target_type = 'review' THEN LEFT(rv.comment, 120)
              WHEN r.target_type = 'host' THEN h.company_name
            END AS target_label
          FROM reports r
          JOIN users u ON u.id = r.reporter_id
          LEFT JOIN users tu ON r.target_type = 'user' AND tu.id = r.target_id
          LEFT JOIN packages pk ON r.target_type = 'package' AND pk.id = r.target_id
          LEFT JOIN reviews rv ON r.target_type = 'review' AND rv.id = r.target_id
          LEFT JOIN hosts h ON r.target_type = 'host' AND h.id = r.target_id
          WHERE ($1 = '' OR r.status = $1)
            AND ($2 = '' OR r.target_type = $2)
            AND (
              $3 = ''
              OR u.name ILIKE $4
              OR u.email ILIKE $4
              OR r.reason ILIKE $4
              OR r.details ILIKE $4
            )
          ORDER BY (r.status = 'open') DESC, r.created_at DESC
          LIMIT $5 OFFSET $6
        `,
        [status, targetType, search, pattern, limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          reports: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getReports:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load reports'
      });
    }
  },

  async updateReportStatus(req, res) {
    try {
      const id = toPositiveInt(req.params.id, -1);
      const status = cleanFilter(req.body?.status);
      const note = cleanFilter(req.body?.note, 500);

      if (!REPORT_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Status must be open, resolved or dismissed'
        });
      }

      // The moderator identity comes from the verified admin token.
      const resolvedBy = status === 'open' ? null : req.user?.id || null;

      const updated = await query(
        `
          UPDATE reports
          SET status = $1,
              resolution_note = NULLIF($2, ''),
              resolved_by = $3,
              resolved_at = CASE WHEN $1 = 'open' THEN NULL ELSE NOW() END,
              updated_at = NOW()
          WHERE id = $4
          RETURNING id, status, resolution_note, resolved_at
        `,
        [status, note, resolvedBy, id]
      );

      if (!updated.rows.length) {
        return res.status(404).json({
          status: 'fail',
          message: 'Report not found'
        });
      }

      logAdminAction(req, 'report.status_changed', 'report', id, {
        to: status,
        note: note || undefined
      });

      res.status(200).json({
        status: 'success',
        data: { report: updated.rows[0] }
      });
    } catch (err) {
      console.error('Error in updateReportStatus:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update the report'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* ANALYTICS                                                          */
  /* ------------------------------------------------------------------ */

  async getAnalytics(req, res) {
    try {
      const totals = await query(`
        SELECT
          (SELECT COUNT(*)::int FROM users) AS total_users,
          (SELECT COUNT(*)::int FROM users WHERE role = 'traveler') AS travelers,
          (SELECT COUNT(*)::int FROM users WHERE role = 'host') AS hosts,
          (SELECT COUNT(*)::int FROM packages) AS total_packages,
          (SELECT COUNT(*)::int FROM destinations) AS total_destinations,
          (SELECT COUNT(*)::int FROM bookings) AS total_bookings,
          (SELECT COUNT(*)::int FROM bookings WHERE status = 'completed') AS completed_bookings,
          (SELECT COUNT(*)::int FROM bookings WHERE status = 'cancelled') AS cancelled_bookings,
          (SELECT COALESCE(SUM(total_price), 0)::float
             FROM bookings
            WHERE status <> 'cancelled') AS gross_revenue,
          (SELECT COUNT(*)::int FROM reviews) AS total_reviews,
          (SELECT ROUND(AVG(rating), 2)::float FROM reviews) AS average_rating
      `);

      const bookingsByMonth = await query(`
        SELECT
          to_char(month, 'YYYY-MM') AS month,
          COUNT(b.id)::int AS bookings,
          COALESCE(SUM(b.total_price), 0)::float AS revenue
        FROM generate_series(
               date_trunc('month', NOW()) - interval '5 months',
               date_trunc('month', NOW()),
               interval '1 month'
             ) AS month
        LEFT JOIN bookings b
          ON date_trunc('month', b.created_at) = month
        GROUP BY month
        ORDER BY month
      `);

      const signupsByMonth = await query(`
        SELECT
          to_char(month, 'YYYY-MM') AS month,
          COUNT(u.id)::int AS signups
        FROM generate_series(
               date_trunc('month', NOW()) - interval '5 months',
               date_trunc('month', NOW()),
               interval '1 month'
             ) AS month
        LEFT JOIN users u
          ON date_trunc('month', u.created_at) = month
        GROUP BY month
        ORDER BY month
      `);

      const bookingStatus = await query(`
        SELECT status, COUNT(*)::int AS count
        FROM bookings
        GROUP BY status
        ORDER BY count DESC
      `);

      const ratingDistribution = await query(`
        SELECT r.rating, COUNT(*)::int AS count
        FROM reviews r
        GROUP BY r.rating
        ORDER BY r.rating
      `);

      const topPackages = await query(`
        SELECT
          p.id,
          p.title,
          p.destination,
          p.price,
          COUNT(b.id)::int AS bookings,
          COALESCE(SUM(b.total_price), 0)::float AS revenue
        FROM packages p
        LEFT JOIN bookings b ON b.package_id = p.id
        GROUP BY p.id
        ORDER BY bookings DESC, revenue DESC
        LIMIT 5
      `);

      const topDestinations = await query(`
        SELECT
          COALESCE(NULLIF(p.destination, ''), d.name) AS destination,
          COUNT(b.id)::int AS bookings,
          COALESCE(SUM(b.total_price), 0)::float AS revenue
        FROM packages p
        JOIN destinations d ON d.id = p.destination_id
        LEFT JOIN bookings b ON b.package_id = p.id
        GROUP BY COALESCE(NULLIF(p.destination, ''), d.name)
        ORDER BY bookings DESC, revenue DESC
        LIMIT 5
      `);

      const hostVerification = await query(`
        SELECT verification_status, COUNT(*)::int AS count
        FROM hosts
        GROUP BY verification_status
        ORDER BY count DESC
      `);

      res.status(200).json({
        status: 'success',
        data: {
          totals: {
            totalUsers: totals.rows[0].total_users,
            travelers: totals.rows[0].travelers,
            hosts: totals.rows[0].hosts,
            totalPackages: totals.rows[0].total_packages,
            totalDestinations: totals.rows[0].total_destinations,
            totalBookings: totals.rows[0].total_bookings,
            completedBookings: totals.rows[0].completed_bookings,
            cancelledBookings: totals.rows[0].cancelled_bookings,
            grossRevenue: totals.rows[0].gross_revenue,
            totalReviews: totals.rows[0].total_reviews,
            averageRating: totals.rows[0].average_rating
          },
          bookingsByMonth: bookingsByMonth.rows,
          signupsByMonth: signupsByMonth.rows,
          bookingStatus: bookingStatus.rows,
          ratingDistribution: ratingDistribution.rows,
          topPackages: topPackages.rows,
          topDestinations: topDestinations.rows,
          hostVerification: hostVerification.rows
        }
      });
    } catch (err) {
      console.error('Error in getAnalytics:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load analytics'
      });
    }
  },

  /* ------------------------------------------------------------------ */
  /* AUDIT TRAIL                                                        */
  /* ------------------------------------------------------------------ */

  async getAuditLog(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query);

      const countResult = await query(
        'SELECT COUNT(*)::int AS total FROM admin_audit_log'
      );

      const result = await query(
        `
          SELECT
            a.id,
            a.actor_id,
            a.actor_email,
            a.action,
            a.target_type,
            a.target_id,
            a.details,
            a.created_at,
            COALESCE(u.name, a.actor_email, 'Deleted user') AS actor_name
          FROM admin_audit_log a
          LEFT JOIN users u ON u.id = a.actor_id
          ORDER BY a.created_at DESC
          LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );

      res.status(200).json({
        status: 'success',
        data: {
          entries: result.rows,
          pagination: {
            page,
            limit,
            total: countResult.rows[0].total,
            pages: Math.max(
              1,
              Math.ceil(countResult.rows[0].total / limit)
            )
          }
        }
      });
    } catch (err) {
      console.error('Error in getAuditLog:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load the audit log'
      });
    }
  }
};

module.exports = adminController;
