const express = require('express');

const router = express.Router();

const travelRadarController =
  require('../controllers/travelRadarController');

router.get(
  '/',
  travelRadarController.getTravelRadar
);

module.exports = router;