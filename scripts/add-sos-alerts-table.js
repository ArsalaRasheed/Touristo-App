/*
 * Adds the sos_alerts table for emergency alerts. Idempotent — safe to
 * run multiple times.
 *
 * Also created by touristo/utils/schemaSetup.js, but setupSchema only runs
 * for local `node index.js`; production/remote databases need this
 * migration applied explicitly.
 *
 * Usage:  node scripts/add-sos-alerts-table.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false,
});

(async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sos_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        trip_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION,
        message TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        acknowledged_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id
      ON sos_alerts(user_id);
    `);

    const { rows } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'sos_alerts'
      ORDER BY ordinal_position;
    `);

    console.log(
      'sos_alerts table present. Columns:',
      rows.map((row) => row.column_name).join(', ')
    );
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();