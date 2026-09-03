const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');

// Get all destinations
router.get('/', destinationController.getAllDestinations);

// Get destination by ID
router.get('/:id', destinationController.getDestinationById);

// Get destination by name
router.get('/name/:name', destinationController.getDestinationByName);

module.exports = router;