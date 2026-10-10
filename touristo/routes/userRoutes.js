const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole, syncRole } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin'), userController.getAllUsers);

// User login
router.post('/login', userController.login);

// Create a new user (public signup - role is restricted server-side)
router.post('/', userController.createUser);

// Get user by ID (self or admin)
router.get('/:id', authenticateToken, syncRole, userController.getUserById);

// Update user (self or admin)
router.put('/:id', authenticateToken, syncRole, userController.updateUser);

// Upload/replace the user's profile photo (self or admin)
router.post('/:id/avatar', authenticateToken, syncRole, userController.uploadAvatar);

// Delete user (self or admin)
router.delete('/:id', authenticateToken, syncRole, userController.deleteUser);

module.exports = router;
