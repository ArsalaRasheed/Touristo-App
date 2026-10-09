const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const packageController = require('../controllers/packageController');
const { authenticateToken, syncRole } = require('../middleware/auth');

// Package detail can generate an AI review summary on cache miss. Bound
// how many different packages a single IP can page through.
const detailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => ipKeyGenerator(req.ip)
});

router.get('/:id', detailLimiter, packageController.getPackageById);

// Get all packages
router.get('/', packageController.getAllPackages);

// Per-account AI cost control: runs after auth so identical
// requests are bounded per host, not only per IP.
const hostAiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => (req.user && req.user.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
  message: {
    status: 'error',
    message: 'You have reached the AI generation limit for now. Please try again later.'
  }
});

// AI package draft for hosts (assistance only, never publishes)
router.post('/ai/generate', authenticateToken, syncRole, hostAiLimiter, packageController.aiGeneratePackage);

// Get package by ID
// Get packages by destination
router.get('/destination/:destinationId', packageController.getPackagesByDestinationId);

// Get packages by host ID
router.get('/host/:hostId', packageController.getPackagesByHostId);

// Create a new package
router.post('/', authenticateToken, syncRole, packageController.createPackage);

// Update package
router.put('/:id', authenticateToken, syncRole, packageController.updatePackage);

// Delete package
router.delete('/:id', authenticateToken, syncRole, packageController.deletePackage);

module.exports = router;