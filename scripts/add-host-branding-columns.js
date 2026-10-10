/*
 * Adds the host branding columns (logo_url, cover_image_url) to the
 * `hosts` table. Idempotent — safe to run multiple times.
 *
 * These columns are also created by touristo/utils/schemaSetup.js, but
 * setupSchema only runs for local `node index.js`; production/remote
 * databases need this migration applied explicitly.
 *
 * Usage:  node scripts/add-host-branding-columns.js
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
      'ALTER TABLE hosts ADD COLUMN IF NOT EXISTS logo_url TEXT;'
    );
    await client.query(
      'ALTER TABLE hosts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;'
    );

    const { rows } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'hosts'
        AND column_name IN ('logo_url', 'cover_image_url')
      ORDER BY column_name;
    `);

    console.log(
      'Host branding columns present:',
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
