const express = require('express');
const { planTrip } = require('../controllers/tripPlannerController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST route for trip planning (authenticated - AI calls are metered)
router.post('/trip-planner', authenticateToken, planTrip);

module.exports = router;