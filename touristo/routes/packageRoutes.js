const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authenticateToken } = require('../middleware/auth');

// Get all packages
router.get('/', packageController.getAllPackages);

// Get package by ID
// Get packages by destination
router.get('/destination/:destinationId', packageController.getPackagesByDestinationId);

// Get packages by host ID
router.get('/host/:hostId', packageController.getPackagesByHostId);

router.get('/:id', packageController.getPackageById);

// Create a new package
router.post('/', authenticateToken, packageController.createPackage);

// Update package
router.put('/:id', authenticateToken, packageController.updatePackage);

// Delete package
router.delete('/:id', authenticateToken, packageController.deletePackage);

module.exports = router;