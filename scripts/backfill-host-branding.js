/*
 * Sets logo_url / cover_image_url on the seeded tour companies that
 * already exist in the database (seedData.js only applies branding to
 * hosts it creates fresh).
 *
 * Logos are only filled when NULL. Covers are filled when NULL or still
 * pointing at a legacy seeded photo. A host-uploaded image is NEVER
 * overwritten.
 *
 * Usage:  node scripts/backfill-host-branding.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const {
  HOST_BRANDING,
  isLegacyHostCover,
} = require('../touristo/utils/hostBranding');

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
    let updated = 0;

    for (const [companyName, branding] of Object.entries(HOST_BRANDING)) {
      const existing = await client.query(
        `SELECT id, logo_url, cover_image_url
           FROM hosts
          WHERE company_name = $1`,
        [companyName]
      );

      if (existing.rows.length === 0) {
        continue;
      }

      for (const host of existing.rows) {
        const nextLogo = host.logo_url || branding.logo_url;
        const nextCover = isLegacyHostCover(host.cover_image_url)
          ? branding.cover_image_url
          : host.cover_image_url;

        if (
          nextLogo === host.logo_url &&
          nextCover === host.cover_image_url
        ) {
          continue;
        }

        await client.query(
          `UPDATE hosts
              SET logo_url = $1,
                  cover_image_url = $2,
                  updated_at = NOW()
            WHERE id = $3`,
          [nextLogo, nextCover, host.id]
        );

        updated += 1;
        console.log(`Branded: ${companyName}`);
      }
    }

    console.log(`Done. Backfilled branding for ${updated} host(s).`);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();