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
const itineraryRoutes = require('./touristo/routes/itineraryRoutes');
const adminRoutes = require('./touristo/routes/adminRoutes');
const reportRoutes = require('./touristo/routes/reportRoutes');
const sosRoutes = require('./touristo/routes/sosRoutes');
const { authenticateToken } = require('./touristo/middleware/auth');
const travelRadarRoutes =
  require('./touristo/routes/travelRadarRoutes');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
// AI endpoints cost real money per call - keep them tight.
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });
// Package detail can generate an AI review summary on cache miss. The
// cache absorbs repeat viewings, but a page-through of many different
// packages would otherwise burn one AI call per package.
const summaryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 80, standardHeaders: true, legacyHeaders: false });

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

// CORS: when CORS_ORIGINS is set (comma separated) only those origins are
// allowed. When unset the API is open - acceptable for local development,
// but production deployments MUST set it.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length > 0
      ? { origin: allowedOrigins, credentials: false }
      : undefined
  )
);

// Apply middleware
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '12mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount routes
app.use('/api', apiLimiter);
// Rate-limit credential endpoints (login + signup) but not profile reads.
app.use('/api/users', (req, res, next) =>
  req.method === 'POST' ? authLimiter(req, res, next) : next()
);
// Tight limit on expensive AI endpoints.
app.use(
  ['/api/trip-planner', '/api/tour-guides/recommend', '/api/packages/ai/generate', '/api/travel-radar'],
  aiLimiter
);
app.use('/api/users', userRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/host/bookings', hostBookingRoutes); // Mounting the new host bookings route
app.use('/api', tripPlannerRoutes); // Add the new route
app.use('/api', generalRoutes); // Add the general routes
app.use('/api/weather', weatherRoutes); // Add the weather routes
app.use('/api/destinations', destinationRoutes); // Add the destination routes
app.use('/api/messages', messageRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/tour-guides', tourGuideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sos', sosRoutes);
app.use(
  '/api/travel-radar',
  travelRadarRoutes
);

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

// Central error handler. Never leaks stack traces, SQL, or secrets to
// the client - full details are logged server-side only.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message:
      err.status && err.status < 500
        ? err.message
        : 'Something went wrong. Please try again.',
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
