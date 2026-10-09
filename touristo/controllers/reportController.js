const { query } = require('../config/database');

const REPORT_TARGET_TYPES = ['review', 'package', 'user', 'host'];

const REPORT_REASONS = [
  'spam',
  'inappropriate content',
  'scam or fraud',
  'harassment',
  'fake listing',
  'other'
];

const cleanText = (value, maxLength) =>
  typeof value === 'string' ? value.trim().substring(0, maxLength) : '';

const toPositiveInt = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/*
|--------------------------------------------------------------------------
| Verify the reported target really exists (and is not the reporter's own).
|--------------------------------------------------------------------------
*/
const TARGET_CHECKS = {
  review: {
    sql: 'SELECT id FROM reviews WHERE id = $1',
    label: 'review'
  },
  package: {
    sql: 'SELECT id FROM packages WHERE id = $1',
    label: 'package'
  },
  user: {
    sql: 'SELECT id FROM users WHERE id = $1',
    label: 'account'
  },
  host: {
    sql: 'SELECT id, user_id FROM hosts WHERE id = $1',
    label: 'tour company'
  }
};

const reportController = {
  async getMyReports(req, res) {
    try {
      const reporterId = req.user?.id;

      if (!reporterId) {
        return res.status(401).json({
          status: 'fail',
          message: 'Sign in to view your reports'
        });
      }

      const page = Math.max(1, toPositiveInt(req.query?.page, 1));
      const limit = Math.min(50, Math.max(1, toPositiveInt(req.query?.limit, 10)));
      const offset = (page - 1) * limit;

      const countResult = await query(
        'SELECT COUNT(*)::int AS total FROM reports WHERE reporter_id = $1',
        [reporterId]
      );

      const result = await query(
        `
          SELECT
            r.id,
            r.target_type,
            r.target_id,
            r.reason,
            r.details,
            r.status,
            r.resolution_note,
            r.resolved_at,
            r.created_at,
            r.updated_at,
            CASE
              WHEN r.target_type = 'user' THEN tu.name
              WHEN r.target_type = 'package' THEN pk.title
              WHEN r.target_type = 'review' THEN LEFT(rv.comment, 120)
              WHEN r.target_type = 'host' THEN h.company_name
            END AS target_label
          FROM reports r
          LEFT JOIN users tu ON r.target_type = 'user' AND tu.id = r.target_id
          LEFT JOIN packages pk ON r.target_type = 'package' AND pk.id = r.target_id
          LEFT JOIN reviews rv ON r.target_type = 'review' AND rv.id = r.target_id
          LEFT JOIN hosts h ON r.target_type = 'host' AND h.id = r.target_id
          WHERE r.reporter_id = $1
          ORDER BY r.created_at DESC
          LIMIT $2 OFFSET $3
        `,
        [reporterId, limit, offset]
      );

      const total = countResult.rows[0].total;

      return res.status(200).json({
        status: 'success',
        data: {
          reports: result.rows,
          pagination: {
            page,
            limit,
            total,
            pages: Math.max(1, Math.ceil(total / limit))
          }
        }
      });
    } catch (err) {
      console.error('Error in getMyReports:', err);

      return res.status(500).json({
        status: 'error',
        message: 'Failed to load your reports'
      });
    }
  },

  async createReport(req, res) {
    try {
      const reporterId = req.user?.id;

      if (!reporterId) {
        return res.status(401).json({
          status: 'fail',
          message: 'Sign in to report content'
        });
      }

      const targetType = cleanText(req.body?.targetType, 20);
      const targetId = toPositiveInt(req.body?.targetId);
      const reason = cleanText(req.body?.reason, 60);
      const details = cleanText(req.body?.details, 1000);

      if (!REPORT_TARGET_TYPES.includes(targetType)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Unknown report target'
        });
      }

      if (!targetId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Missing report target'
        });
      }

      if (!REPORT_REASONS.includes(reason)) {
        return res.status(400).json({
          status: 'fail',
          message: `Reason must be one of: ${REPORT_REASONS.join(', ')}`
        });
      }

      const check = TARGET_CHECKS[targetType];
      const targetResult = await query(check.sql, [targetId]);
      const target = targetResult.rows[0];

      if (!target) {
        return res.status(404).json({
          status: 'fail',
          message: `This ${check.label} no longer exists`
        });
      }

      // Never allow self-reporting (user on themselves, host on their own listing).
      if (targetType === 'user' && target.id === reporterId) {
        return res.status(400).json({
          status: 'fail',
          message: 'You cannot report your own account'
        });
      }

      if (
        targetType === 'host' &&
        target.user_id === reporterId
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'You cannot report your own company'
        });
      }

      if (targetType === 'package') {
        const ownerResult = await query(
          'SELECT h.user_id FROM packages p INNER JOIN hosts h ON h.id = p.host_id WHERE p.id = $1',
          [targetId]
        );

        if (ownerResult.rows[0]?.user_id === reporterId) {
          return res.status(400).json({
            status: 'fail',
            message: 'You cannot report your own package'
          });
        }
      }

      const duplicateResult = await query(
        `
          SELECT id FROM reports
          WHERE reporter_id = $1
            AND target_type = $2
            AND target_id = $3
            AND status = 'open'
          LIMIT 1
        `,
        [reporterId, targetType, targetId]
      );

      if (duplicateResult.rows.length) {
        return res.status(409).json({
          status: 'fail',
          message: 'You already reported this. Our moderators are reviewing it.'
        });
      }

      const insertResult = await query(
        `
          INSERT INTO reports
            (reporter_id, target_type, target_id, reason, details)
          VALUES ($1, $2, $3, $4, NULLIF($5, ''))
          RETURNING id, target_type, target_id, reason, status, created_at
        `,
        [reporterId, targetType, targetId, reason, details]
      );

      return res.status(201).json({
        status: 'success',
        data: { report: insertResult.rows[0] },
        message: 'Report submitted. Our moderators will review it.'
      });
    } catch (err) {
      // Unique partial index - duplicate open report under a race condition.
      if (err?.code === '23505') {
        return res.status(409).json({
          status: 'fail',
          message: 'You already reported this. Our moderators are reviewing it.'
        });
      }

      console.error('Error in createReport:', err);

      return res.status(500).json({
        status: 'error',
        message: 'Failed to submit the report'
      });
    }
  }
};

module.exports = reportController;
