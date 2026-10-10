const express = require('express');
const router = express.Router();

const sosController = require('../controllers/sosController');
const { authenticateToken, syncRole } = require('../middleware/auth');

// Create an SOS alert (server stores it as Sent - never auto-delivered)
router.post('/', authenticateToken, sosController.createSosAlert);

// List the caller's own alerts with delivery statuses
router.get('/my', authenticateToken, sosController.listMySosAlerts);

// Explicit confirmation that help was reached
router.patch('/:id/ack', authenticateToken, sosController.acknowledgeSosAlert);

// Remove an alert (e.g. after local queue cleanup)
router.delete('/:id', authenticateToken, sosController.clearSosAlert);

module.exports = router;