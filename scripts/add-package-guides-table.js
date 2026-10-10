/*
 * Adds the package_guides junction table (which of a host's tour guides are
 * assigned to a package). Idempotent — safe to run multiple times.
 *
 * The table is also created by touristo/utils/schemaSetup.js, but setupSchema
 * only runs for local `node index.js`; production/remote databases need this
 * migration applied explicitly.
 *
 * Usage:  node scripts/add-package-guides-table.js
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
      CREATE TABLE IF NOT EXISTS package_guides (
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        tour_guide_id INTEGER NOT NULL REFERENCES tour_guides(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (package_id, tour_guide_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_package_guides_tour_guide_id
      ON package_guides(tour_guide_id);
    `);

    const { rows } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'package_guides'
      ORDER BY ordinal_position;
    `);

    console.log(
      'package_guides table present. Columns:',
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