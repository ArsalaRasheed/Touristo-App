const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

/*
|--------------------------------------------------------------------------
| Report creation limits (per authenticated user)
|--------------------------------------------------------------------------
| 5 reports per 15 minutes and 20 reports per 24 hours.
| Both limiters run after authenticateToken so the key is the user id.
*/

const reportLimiter = (limit, windowMs, friendlyMessage) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: req =>
      req.user?.id ? `report-user-${req.user.id}` : 'report-anonymous',
    message: {
      status: 'fail',
      message: friendlyMessage
    }
  });

const reportBurstLimiter = reportLimiter(
  5,
  15 * 60 * 1000,
  'You have submitted several reports in a short time. Please wait about 15 minutes and try again.'
);

const reportDailyLimiter = reportLimiter(
  20,
  24 * 60 * 60 * 1000,
  'You have reached your daily report limit. Please try again later.'
);

// Reports submitted by the signed-in user
router.get('/mine', authenticateToken, reportController.getMyReports);

// Submit a report (review, package, user or host)
router.post(
  '/',
  authenticateToken,
  reportBurstLimiter,
  reportDailyLimiter,
  reportController.createReport
);

module.exports = router;
