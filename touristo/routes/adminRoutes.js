const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// Overview
router.get('/dashboard', requireAdmin, adminController.getDashboardOverview);

// Analytics
router.get('/analytics', requireAdmin, adminController.getAnalytics);

// Audit trail of admin actions
router.get('/audit', requireAdmin, adminController.getAuditLog);

// Users
router.get('/users', requireAdmin, adminController.getUsers);
router.patch('/users/:id/role', requireAdmin, adminController.updateUserRole);

// Hosts and verification
router.get('/hosts', requireAdmin, adminController.getHosts);
router.patch(
  '/hosts/:id/verification',
  requireAdmin,
  adminController.updateHostVerification
);

// Packages
router.get('/packages', requireAdmin, adminController.getPackages);
router.delete('/packages/:id', requireAdmin, adminController.deletePackage);

// Bookings
router.get('/bookings', requireAdmin, adminController.getBookings);
router.patch(
  '/bookings/:id/status',
  requireAdmin,
  adminController.updateBookingStatus
);

// Reviews
router.get('/reviews', requireAdmin, adminController.getReviews);
router.delete('/reviews/:id', requireAdmin, adminController.deleteReview);

// Moderation - user reports
router.get('/reports', requireAdmin, adminController.getReports);
router.patch('/reports/:id/status', requireAdmin, adminController.updateReportStatus);

module.exports = router;
