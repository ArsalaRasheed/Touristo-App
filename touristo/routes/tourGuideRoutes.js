const express = require('express');

const router = express.Router();

const TourGuide = require('../models/TourGuide');
const Host = require('../models/Host');

const { authenticateToken, syncRole } = require('../middleware/auth');
const { isAdmin } = require('../middleware/accessControl');

const tourGuideController = require('../controllers/tourGuideController');

/**
 * Loads the guide and verifies the caller owns the host it belongs to.
 * Admins always pass. Responds with an error and returns null on failure.
 */
const loadGuideWithOwnershipCheck = async (req, res) => {
  const guide = await TourGuide.findById(req.params.id);

  if (!guide) {
    res.status(404).json({
      success: false,
      message: 'Tour guide not found',
    });
    return null;
  }

  if (!isAdmin(req)) {
    const host = await Host.findById(guide.host_id);

    if (!host || Number(host.user_id) !== Number(req.user?.id)) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this tour guide',
      });
      return null;
    }
  }

  return guide;
};

// GET /api/tour-guides - Get all tour guides (public catalog)
router.get('/', async (req, res) => {
  try {
    const tourGuides = await TourGuide.findAll();

    res.json({
      success: true,
      data: tourGuides,
    });
  } catch (error) {
    console.error('Error fetching tour guides:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tour guides',
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
      data: tourGuides,
    });
  } catch (error) {
    console.error('Error fetching tour guides:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tour guides',
    });
  }
});

// POST /api/tour-guides/recommend
// AI recommends the best tour guide based on user's preference
router.post('/recommend', authenticateToken, tourGuideController.recommendGuide);

// GET /api/tour-guides/:id - Get a specific tour guide
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tourGuide = await TourGuide.findById(id);

    if (!tourGuide) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found',
      });
    }

    res.json({
      success: true,
      data: tourGuide,
    });
  } catch (error) {
    console.error('Error fetching tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tour guide',
    });
  }
});

// POST /api/tour-guides - Create a new tour guide (host owner or admin)
router.post('/', authenticateToken, syncRole, async (req, res) => {
  try {
    const { host_id, name, specialty, photo, rating } = req.body || {};

    if (!host_id || !name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'Host ID, name and specialty are required',
      });
    }

    const trimmedName = String(name).trim().slice(0, 255);
    const trimmedSpecialty = String(specialty).trim().slice(0, 255);

    if (!trimmedName || !trimmedSpecialty) {
      return res.status(400).json({
        success: false,
        message: 'Name and specialty cannot be empty',
      });
    }

    const host = await Host.findById(host_id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    if (!isAdmin(req) && Number(host.user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add guides to this host profile',
      });
    }

    const parsedRating = Number(rating);
    const safeRating =
      Number.isFinite(parsedRating)
        ? Math.min(5, Math.max(0, Math.round(parsedRating * 100) / 100))
        : null;

    const newTourGuide = await TourGuide.create({
      host_id,
      name: trimmedName,
      specialty: trimmedSpecialty,
      photo: typeof photo === 'string' ? photo.trim().slice(0, 2000) : null,
      rating: safeRating,
    });

    res.status(201).json({
      success: true,
      data: newTourGuide,
    });
  } catch (error) {
    console.error('Error creating tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error creating tour guide',
    });
  }
});

// PUT /api/tour-guides/:id - Update a tour guide (host owner or admin)
router.put('/:id', authenticateToken, syncRole, async (req, res) => {
  try {
    const guide = await loadGuideWithOwnershipCheck(req, res);
    if (!guide) return;

    const { name, specialty, photo, rating } = req.body || {};

    const trimmedName =
      typeof name === 'string' && name.trim()
        ? name.trim().slice(0, 255)
        : guide.name;
    const trimmedSpecialty =
      typeof specialty === 'string' && specialty.trim()
        ? specialty.trim().slice(0, 255)
        : guide.specialty;

    const parsedRating = Number(rating);
    const safeRating =
      rating !== undefined && Number.isFinite(parsedRating)
        ? Math.min(5, Math.max(0, Math.round(parsedRating * 100) / 100))
        : guide.rating;

    const updatedTourGuide = await TourGuide.update(req.params.id, {
      name: trimmedName,
      specialty: trimmedSpecialty,
      photo: typeof photo === 'string' ? photo.trim().slice(0, 2000) : guide.photo,
      rating: safeRating,
    });

    if (!updatedTourGuide) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found',
      });
    }

    res.json({
      success: true,
      data: updatedTourGuide,
    });
  } catch (error) {
    console.error('Error updating tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error updating tour guide',
    });
  }
});

// DELETE /api/tour-guides/:id - Delete a tour guide (host owner or admin)
router.delete('/:id', authenticateToken, syncRole, async (req, res) => {
  try {
    const guide = await loadGuideWithOwnershipCheck(req, res);
    if (!guide) return;

    const deleted = await TourGuide.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found',
      });
    }

    res.json({
      success: true,
      message: 'Tour guide deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tour guide:', error);

    res.status(500).json({
      success: false,
      message: 'Error deleting tour guide',
    });
  }
});

module.exports = router;
