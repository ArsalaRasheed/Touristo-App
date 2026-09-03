const { Pool } = require('pg');

// Database configuration using environment variables
let dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// Handle SSL configuration for Supabase
if (process.env.DB_SSL_MODE === 'require') {
  dbConfig.ssl = { rejectUnauthorized: false };
} else if (process.env.DB_SSL_MODE === 'enable') {
  dbConfig.ssl = true;
} else {
  dbConfig.ssl = false; // Explicitly set to false if not enabled
}

// Create a connection pool
const pool = new Pool(dbConfig);

// Test the connection
const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
    throw err;
  }
};

// Export the pool and connection function
module.exports = {
  query: (text, params) => pool.query(text, params),
  connectDB,
};