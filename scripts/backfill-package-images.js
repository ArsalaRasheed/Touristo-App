/*
 * Replaces the duplicate / dead images on the seeded demo packages that
 * already exist in the database (seedData.js only sets images on the rows
 * it inserts fresh, so older databases keep the old photos).
 *
 * A host-uploaded / custom image is NEVER touched - only rows whose image
 * is NULL or still points at one of the legacy seeded photos are updated.
 *
 * Usage:  node scripts/backfill-package-images.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const {
  PACKAGE_IMAGES,
  isLegacyPackageImage,
} = require('../touristo/utils/packageImages');

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
    const titles = Object.keys(PACKAGE_IMAGES);

    const result = await client.query(
      `SELECT id, title, image
         FROM packages
        WHERE title = ANY($1)`,
      [titles]
    );

    let updated = 0;

    for (const row of result.rows) {
      if (!isLegacyPackageImage(row.image)) {
        console.log(`Skipped (custom image): ${row.title}`);
        continue;
      }

      const curatedImage = PACKAGE_IMAGES[row.title];

      if (curatedImage === row.image) {
        continue;
      }

      await client.query(
        `UPDATE packages
            SET image = $1,
                updated_at = NOW()
          WHERE id = $2`,
        [curatedImage, row.id]
      );

      updated += 1;
      console.log(`Fixed: ${row.title}`);
    }

    console.log(`Done. Updated ${updated} package image(s).`);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
