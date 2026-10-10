const User = require('../models/User');
const { query } = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');
const { sanitizeUser } = require('../middleware/accessControl');
const {
  uploadUserAvatar,
  PackageImageValidationError,
  PackageImageStorageError
} = require('../utils/packageStorage');

// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Roles a user may self-select at signup. 'admin' can never be chosen
// by a client - admin accounts are granted explicitly by another admin.
const SIGNUP_ROLES = ['traveler', 'host'];

const userController = {
  // Get user by ID with stats (self or admin only)
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const isSelf = Number(req.user.id) === Number(id);
      const isAdmin = req.user.role === 'admin';

      if (!isSelf && !isAdmin) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to view this profile',
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found',
        });
      }

      // Get user statistics
      const statsResult = await query(`
        SELECT 
          (SELECT COUNT(*) FROM bookings WHERE user_id = $1) AS total_trips,
          (SELECT COUNT(*) FROM reviews WHERE user_id = $1) AS total_reviews
      `, [id]);
      
      const stats = statsResult.rows[0] || { total_trips: 0, total_reviews: 0 };
      
      // Get user's favorite destinations/packages (this would require a favorites table which may not exist)
      // For now, we'll return an empty array
      const favorites = []; // Would come from a favorites table in real implementation

      res.status(200).json({
        status: 'success',
        data: { 
          user: sanitizeUser(user),
          stats: {
            totalTrips: parseInt(stats.total_trips) || 0,
            totalReviews: parseInt(stats.total_reviews) || 0,
            totalFavorites: favorites.length
          },
          favorites
        },
      });
    } catch (err) {
      console.error('Error in getUserById:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Email and password are required',
        });
      }
      
      // Basic email format validation
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid email format',
        });
      }
      
      // Find user by email
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid email or password',
        });
      }
      
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid email or password',
        });
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Return user data (without sensitive info like password_hash) and token
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      };
      
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token, // Include token in response
        data: { user: userData },
      });
    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // Get all users (admin only - enforced at the route level)
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users: users.map(sanitizeUser) },
      });
    } catch (err) {
      console.error('Error in getAllUsers:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // Create a new user
  async createUser(req, res) {
    try {
      const { name, email, password, phone, role } = req.body;
      // Never trust a client-supplied role outside the signup whitelist.
      const userRole = SIGNUP_ROLES.includes(role) ? role : 'traveler';
      
      // Basic validation
      if (!name || !email || !password || !phone) {
        return res.status(400).json({
          status: 'fail',
          message: 'Name, email, password, and phone are required',
        });
      }

      // Email format validation
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid email format',
        });
      }

      // Phone number validation (basic - must be at least 10 digits)
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return res.status(400).json({
          status: 'fail',
          message: 'Phone number must contain at least 10 digits',
        });
      }

      // Sanitize inputs
      const sanitizedName = name.trim();
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPhone = phone.trim();

      // Check if user already exists
      const existingUser = await User.findByEmail(sanitizedEmail);
      if (existingUser) {
        return res.status(409).json({
          status: 'fail',
          message: 'User with this email already exists',
        });
      }

      const newUser = await User.create({ 
        name: sanitizedName, 
        email: sanitizedEmail, 
        password, 
        phone: sanitizedPhone, 
        role: userRole 
      });
        const userData = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          avatar_url: newUser.avatar_url,
          created_at: newUser.created_at
        };
        const token = generateToken({
          id: userData.id,
          email: userData.email,
          role: userData.role
        });
      res.status(201).json({
        status: 'success',
          token,
          data: { user: userData },
      });
    } catch (err) {
      console.error('Error in createUser:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // Update user (self or admin). Role and password can never be changed here.
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      const isSelf = Number(req.user.id) === Number(id);
      const isAdmin = req.user.role === 'admin';

      if (!isSelf && !isAdmin) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to update this profile',
        });
      }

      const existing = await User.findById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found',
        });
      }

      // Email format validation if email is provided
      if (email && !emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid email format',
        });
      }

      // Merge with the existing row so partial updates never wipe fields
      // (the model requires name/email/phone to all be present).
      const updatedUser = await User.update(id, {
        name: name && String(name).trim() ? String(name).trim() : existing.name,
        email:
          email && String(email).trim()
            ? String(email).trim().toLowerCase()
            : existing.email,
        phone: phone && String(phone).trim() ? String(phone).trim() : existing.phone,
      });

      if (!updatedUser) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { user: sanitizeUser(updatedUser) },
      });
    } catch (err) {
      console.error('Error in updateUser:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // Upload or replace the user's profile photo (self or admin only)
  async uploadAvatar(req, res) {
    try {
      const { id } = req.params;

      const isSelf = Number(req.user.id) === Number(id);
      const isAdmin = req.user.role === 'admin';

      if (!isSelf && !isAdmin) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to update this profile',
        });
      }

      const existing = await User.findById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found',
        });
      }

      const { image_data, image_name, image_type } = req.body || {};

      const uploaded = await uploadUserAvatar({
        imageData: image_data,
        imageName: image_name,
        imageType: image_type,
      });

      const result = await query(
        'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [uploaded.url, id]
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: sanitizeUser(new User(result.rows[0])),
          image_url: uploaded.url,
        },
      });
    } catch (err) {
      if (err instanceof PackageImageValidationError) {
        return res.status(400).json({
          status: 'fail',
          message: err.message,
        });
      }

      if (err instanceof PackageImageStorageError) {
        console.error(
          'User avatar storage error:',
          err.message
        );
        return res.status(502).json({
          status: 'error',
          message:
            'Could not store the image right now. Please try again.',
        });
      }

      console.error('Error in uploadAvatar:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // Delete user (self or admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const isSelf = Number(req.user.id) === Number(id);
      const isAdmin = req.user.role === 'admin';

      if (!isSelf && !isAdmin) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to delete this account',
        });
      }

      const deleted = await User.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      console.error('Error in deleteUser:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },
};

module.exports = userController;