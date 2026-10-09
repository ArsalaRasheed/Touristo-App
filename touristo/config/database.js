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

// Idle pooled connections can be dropped by the server/proxy. Without a
// listener, pg emits an unhandled 'error' event and the process exits.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

// Optional: close idle clients occasionally to avoid stale pooled connections
pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('Pooled client error:', err.message);
  });
});

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

// Export the pool, connection function and a transaction helper
module.exports = {
  query: (text, params) => pool.query(text, params),
  connectDB,

  // Runs several queries on ONE dedicated connection inside a transaction.
  // Used by moderation actions where partial writes must never happen.
  withTransaction: async (work) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Transaction rollback failed:', rollbackErr.message);
      }
      throw err;
    } finally {
      client.release();
    }
  }
};