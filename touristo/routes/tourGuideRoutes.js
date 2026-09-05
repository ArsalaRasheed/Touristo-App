const express = require('express');

const router = express.Router();

const TourGuide = require('../models/TourGuide');

const { authenticateToken } = require('../middleware/auth');

const tourGuideController = require('../controllers/tourGuideController');


// GET /api/tour-guides - Get all tour guides
router.get('/', async (req, res) => {
  try {
    const tourGuides = await TourGuide.findAll();

    res.json({
      success: true,
      data: tourGuides
    });

  } catch (error) {
    console.error('Error fetching tour guides:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tour guides',
      error: error.message
    });
  }
});


// GET /api/tour-guides/host/:hostId - Get all tour guides for a specific host
router.get('/host/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;

    const tourGuides = await TourGuide.findByHostId(hostId);

    res.json({
      success: true,
      data: tourGuides
    });

  } catch (error) {
    console.error('Error fetching tour guides:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tour guides',
      error: error.message
    });
  }
});


// POST /api/tour-guides/recommend
// AI recommends the best tour guide based on user's preference
router.post('/recommend', tourGuideController.recommendGuide);


// GET /api/tour-guides/:id - Get a specific tour guide
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tourGuide = await TourGuide.findById(id);

    if (!tourGuide) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found'
      });
    }

    res.json({
      success: true,
      data: tourGuide
    });

  } catch (error) {
    console.error('Error fetching tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tour guide',
      error: error.message
    });
  }
});


// POST /api/tour-guides - Create a new tour guide
router.post('/', authenticateToken, async (req, res) => {
  try {
    const tourGuideData = req.body;

    const newTourGuide = await TourGuide.create(tourGuideData);

    res.status(201).json({
      success: true,
      data: newTourGuide
    });

  } catch (error) {
    console.error('Error creating tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error creating tour guide',
      error: error.message
    });
  }
});


// PUT /api/tour-guides/:id - Update a tour guide
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const updatedTourGuide = await TourGuide.update(id, updateData);

    if (!updatedTourGuide) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found'
      });
    }

    res.json({
      success: true,
      data: updatedTourGuide
    });

  } catch (error) {
    console.error('Error updating tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error updating tour guide',
      error: error.message
    });
  }
});


// DELETE /api/tour-guides/:id - Delete a tour guide
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TourGuide.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour guide deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error deleting tour guide',
      error: error.message
    });
  }
});


module.exports = router;