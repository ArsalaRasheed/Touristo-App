const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const { authenticateToken } = require('../middleware/auth');

// Get all hosts
router.get('/', hostController.getAllHosts);

// Get host by user ID
router.get('/user/:id', hostController.getHostByUserId);

// Get host by ID
router.get('/:id', hostController.getHostById);

// Create a new host
router.post('/', authenticateToken, hostController.createHost);

// Update host
router.put('/:id', authenticateToken, hostController.updateHost);

// Delete host
router.delete('/:id', authenticateToken, hostController.deleteHost);

module.exports = router;