const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Load environment variables

// Import route modules from the touristo subfolder
const userRoutes = require('./touristo/routes/userRoutes');
const hostRoutes = require('./touristo/routes/hostRoutes');
const packageRoutes = require('./touristo/routes/packageRoutes');
const bookingRoutes = require('./touristo/routes/bookingRoutes');
const reviewRoutes = require('./touristo/routes/reviewRoutes');
const hostBookingRoutes = require('./touristo/routes/hostBookingRoutes'); // New import for host bookings
const tripPlannerRoutes = require('./touristo/routes/tripPlannerRoutes'); // New import
const generalRoutes = require('./touristo/routes/generalRoutes'); // New import
const weatherRoutes = require('./touristo/routes/weatherRoutes'); // New import
const destinationRoutes = require('./touristo/routes/destinationRoutes'); // New import for destinations
const messageRoutes = require('./touristo/routes/messageRoutes');
const tourGuideRoutes = require('./touristo/routes/tourGuideRoutes');
const { authenticateToken } = require('./touristo/middleware/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount routes
app.use('/api', apiLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users', userRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/host/bookings', hostBookingRoutes); // Mounting the new host bookings route
app.use('/api', tripPlannerRoutes); // Add the new route
app.use('/api', generalRoutes); // Add the general routes
app.use('/api/weather', weatherRoutes); // Add the weather routes
app.use('/api/destinations', destinationRoutes); // Add the destination routes
app.use('/api/messages', messageRoutes);
app.use('/api/tour-guides', tourGuideRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Touristo API',
  });
});

// Handle 404 errors - Changed from '*' to '(.*)' for Express 5.x compatibility
app.use(/(.*)/, (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Export the Express app for Vercel/serverless use.
module.exports = app;

// Connect to database and start server locally only
const { connectDB } = require('./touristo/config/database');
const { seedDatabase } = require('./touristo/utils/seedData'); // Import seeding function
const { setupSchema } = require('./touristo/utils/schemaSetup'); // Import schema setup function

const PORT = process.env.PORT || 3000;

// Start server immediately when running `node index.js` locally.
let server;
if (require.main === module) {
server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    // Attempt to set up the database schema first
    await setupSchema();
    console.log('Database schema setup completed');
    
    // Then seed the database with initial data
    await seedDatabase();
    console.log('Database seeding completed');
  } catch (setupErr) {
    console.error('Error during database setup or seeding:', setupErr);
  }
});
}

// Handle any potential server errors
if (server) server.on('error', (err) => {
  console.error('Server error:', err);
});

// Try to connect to database asynchronously without blocking
const attemptDbConnection = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (err) {
    console.warn('Warning: Could not connect to database:', err.message);
    console.log('Server is running but database is not connected. Some features may be unavailable.');
  }
};

// Call the database connection function locally only
if (require.main === module) {
  attemptDbConnection().catch(console.error);
}

// Prevent process from exiting on unhandled promise rejections locally
if (require.main === module) process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('Continuing execution...');
});
