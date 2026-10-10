/*
 * Adds the user avatar column (avatar_url) to the `users` table.
 * Idempotent — safe to run multiple times.
 *
 * The column is also created by touristo/utils/schemaSetup.js, but
 * setupSchema only runs for local `node index.js`; production/remote
 * databases need this migration applied explicitly.
 *
 * Usage:  node scripts/add-user-avatar-column.js
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
    await client.query(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;'
    );

    const { rows } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'avatar_url'
      ORDER BY column_name;
    `);

    console.log(
      'User avatar column present:',
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