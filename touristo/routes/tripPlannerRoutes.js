const express = require('express');
const { planTrip } = require('../controllers/tripPlannerController');
const router = express.Router();

// POST route for trip planning
router.post('/trip-planner', planTrip);

module.exports = router;