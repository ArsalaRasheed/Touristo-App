/*
 * Removes test/probe data left behind by scripts/package-probes.js,
 * scripts/package-image-probes.js and scripts/security-probes.js.
 *
 * Probe accounts are identified by the reserved `@touristo.test` email
 * domain and their probe host company names. Deleting a matching user
 * cascades to their hosts, packages, guides, messages and bookings.
 *
 * Usage:  node scripts/cleanup-probe-data.js
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

const PROBE_EMAIL = '%@touristo.test';
const PROBE_HOST_NAME =
  '^(Phase1 Probes|Image Probes|Other) [0-9]+$|^Dbg[0-9]+$';
const PROBE_PACKAGE_TITLES = [
  'Phase1 Probe Package',
  'Phase1 Probe Package Updated',
  'Image Probe Package',
  'Image Probe Package Edited',
  'Dbg Pkg Edited',
  'Hijacked',
];

(async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const users = await client.query(
      `SELECT id, name, email FROM users
        WHERE email LIKE $1
           OR name IN ('Phase1 Host','Image Probe Host','Phase1 Traveler',
                       'Phase1 Other','Probe User','Ai Tester')`,
      [PROBE_EMAIL]
    );
    const userIds = users.rows.map((r) => r.id);

    const hosts = await client.query(
      `SELECT id, company_name FROM hosts
        WHERE user_id = ANY($1::int[])
           OR company_name ~ $2`,
      [userIds, PROBE_HOST_NAME]
    );
    const hostIds = hosts.rows.map((r) => r.id);

    const packages = await client.query(
      `SELECT id, title FROM packages
        WHERE host_id = ANY($1::int[])
           OR title = ANY($2::text[])`,
      [hostIds, PROBE_PACKAGE_TITLES]
    );
    const packageIds = packages.rows.map((r) => r.id);

    const counts = {};

    const del = async (label, sql, params) => {
      const res = await client.query(sql, params);
      counts[label] = res.rowCount;
    };

    await del(
      'reviews',
      `DELETE FROM reviews WHERE package_id = ANY($1::int[]) OR user_id = ANY($2::int[])`,
      [packageIds, userIds]
    );
    await del(
      'bookings',
      `DELETE FROM bookings WHERE package_id = ANY($1::int[]) OR user_id = ANY($2::int[])`,
      [packageIds, userIds]
    );
    await del(
      'messages',
      `DELETE FROM messages
        WHERE associated_package_id = ANY($1::int[])
           OR sender_id = ANY($2::int[])
           OR receiver_id = ANY($2::int[])`,
      [packageIds, userIds]
    );
    await del(
      'marketplace_chats',
      `DELETE FROM marketplace_chats WHERE host_id = ANY($1::int[]) OR traveler_id = ANY($2::int[])`,
      [hostIds, userIds]
    );
    await del(
      'reports',
      `DELETE FROM reports WHERE reporter_id = ANY($1::int[])`,
      [userIds]
    );
    await del(
      'tour_guides',
      `DELETE FROM tour_guides WHERE host_id = ANY($1::int[])`,
      [hostIds]
    );
    await del(
      'review_summaries',
      `DELETE FROM review_summaries WHERE package_id = ANY($1::int[])`,
      [packageIds]
    );
    await del(
      'packages',
      `DELETE FROM packages WHERE id = ANY($1::int[])`,
      [packageIds]
    );
    await del(
      'hosts',
      `DELETE FROM hosts WHERE id = ANY($1::int[])`,
      [hostIds]
    );
    await del(
      'users',
      `DELETE FROM users WHERE id = ANY($1::int[])`,
      [userIds]
    );

    await client.query('COMMIT');

    console.log('Probe cleanup complete.');
    console.log(`  packages removed:  ${packageIds.length}`);
    console.log(`  hosts removed:     ${hostIds.length}`);
    console.log(`  users removed:     ${userIds.length}`);
    console.log('  related rows:', counts);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cleanup failed, rolled back:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
