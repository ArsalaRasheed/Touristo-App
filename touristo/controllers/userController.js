const User = require('../models/User');
const { query } = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');

// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userController = {
  // Get user by ID with stats
  async getUserById(req, res) {
    try {
      const { id } = req.params;
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
          user,
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
        message: err.message,
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
        message: err.message,
      });
    }
  },

  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
      });
    } catch (err) {
      console.error('Error in getAllUsers:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new user
  async createUser(req, res) {
    try {
      const { name, email, password, phone, role } = req.body;
      
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
        role 
      });
        const userData = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
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
        message: err.message,
      });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      // Email format validation if email is provided
      if (email && !emailRegex.test(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid email format',
        });
      }

      // Sanitize inputs
      const sanitizedName = name ? name.trim() : undefined;
      const sanitizedEmail = email ? email.trim().toLowerCase() : undefined;
      const sanitizedPhone = phone ? phone.trim() : undefined;

      const updatedUser = await User.update(id, { 
        name: sanitizedName, 
        email: sanitizedEmail, 
        phone: sanitizedPhone 
      });

      if (!updatedUser) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (err) {
      console.error('Error in updateUser:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

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
        message: err.message,
      });
    }
  },
};

module.exports = userController;