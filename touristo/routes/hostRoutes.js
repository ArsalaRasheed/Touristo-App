const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const { authenticateToken, optionalAuth, syncRole } = require('../middleware/auth');

// Get all hosts (public listing - PII scrubbed unless the caller is the owner)
router.get('/', optionalAuth, hostController.getAllHosts);

// Get host by user ID (public listing - PII scrubbed unless owner/admin)
router.get('/user/:id', optionalAuth, hostController.getHostByUserId);

// Get host by ID (public listing - PII scrubbed unless owner/admin)
router.get('/:id', optionalAuth, hostController.getHostById);

// Create a new host (bound to the authenticated user)
router.post('/', authenticateToken, syncRole, hostController.createHost);

// Update host
router.put('/:id', authenticateToken, syncRole, hostController.updateHost);

// Upload/replace a branding image (logo or cover) - owner/admin only
router.post('/:id/images', authenticateToken, syncRole, hostController.uploadHostBrandingImage);

// Delete host
router.delete('/:id', authenticateToken, syncRole, hostController.deleteHost);

module.exports = router;
