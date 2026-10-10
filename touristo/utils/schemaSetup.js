// Import the shared database pool from config/database.js
const { query: sharedQuery } = require('../config/database');

// A helper to execute queries and log them, mimicking the old behavior if needed
async function query(text, params) {
  const start = Date.now();
  const res = await sharedQuery(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

/**
 * Setup the database schema
 */
async function setupSchema() {
  try {
    // Create all tables only if they don't already exist yet — never drop existing tables/data.
    console.log("Ensuring database schema exists...");
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL, -- This will now work as the table is empty
        phone VARCHAR(20) NOT NULL, -- Made phone required
        role VARCHAR(50) DEFAULT 'traveler',
        avatar_url TEXT, -- User account profile photo (public URL)
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const createHostsTable = `
      CREATE TABLE IF NOT EXISTS hosts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        company_name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        license_number VARCHAR(100),
        cnic_or_business_registration VARCHAR(100), -- Added CNIC/business registration field
        company_address TEXT, -- Added company address field
        verification_status VARCHAR(20) DEFAULT 'pending', -- Added verification status field
        verified BOOLEAN DEFAULT FALSE, -- Adding the missing column
        rating_score DECIMAL(3,2) DEFAULT 0.00, -- Adding the missing rating_score column
        rating DECIMAL(3,2) DEFAULT 0.00,
        logo_url TEXT, -- Company logo (public Supabase Storage URL)
        cover_image_url TEXT, -- Company cover/banner image (public URL)
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('Executing command:', createHostsTable);
    await query(createHostsTable);

    const createDestinationsTable = `
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        history TEXT,
        culture TEXT,
        famous_spots TEXT, -- Adding the missing column
        famous_food TEXT,  -- Adding the missing column
        latitude DECIMAL(10, 8),  -- For coordinates
        longitude DECIMAL(11, 8), -- For coordinates
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('Executing command:', createDestinationsTable);
    await query(createDestinationsTable);

    const createPackagesTable = `
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        host_id INTEGER NOT NULL REFERENCES hosts(id),
        destination_id INTEGER NOT NULL REFERENCES destinations(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration_days INTEGER,
        location VARCHAR(255),
        image TEXT,
        destination VARCHAR(255),
        inclusions TEXT[],
        exclusions TEXT[],
        itinerary JSONB,  -- Adding itinerary field to store day-by-day information
        group_size VARCHAR(50), -- Adding group size information
        highlights TEXT[],
        activities TEXT[],
        tags TEXT[],
        target_traveler_type VARCHAR(80),
        best_season VARCHAR(80),
        safety_notes TEXT[],
        seo_description VARCHAR(300),
        availability_start DATE,
        availability_end DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('Executing command:', createPackagesTable);
    await query(createPackagesTable);

    const packageSchemaColumns = [
      "ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}'::text[]",
      "ADD COLUMN IF NOT EXISTS activities TEXT[] DEFAULT '{}'::text[]",
      "ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[]",
      "ADD COLUMN IF NOT EXISTS target_traveler_type VARCHAR(80)",
      "ADD COLUMN IF NOT EXISTS best_season VARCHAR(80)",
      "ADD COLUMN IF NOT EXISTS safety_notes TEXT[] DEFAULT '{}'::text[]",
      "ADD COLUMN IF NOT EXISTS seo_description VARCHAR(300)"
    ];
    for (const columnDdl of packageSchemaColumns) {
      await query(`ALTER TABLE packages ${columnDdl}`);
    }

    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        package_id INTEGER NOT NULL REFERENCES packages(id),
        booking_date DATE DEFAULT CURRENT_DATE,
        start_date DATE, -- Made nullable to align with seed data inserting travel_date
        end_date DATE,   -- Made nullable to align with seed data inserting travel_date
        travel_date DATE, -- Adding the missing travel_date column
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        travelers INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        package_id INTEGER NOT NULL REFERENCES packages(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS review_summaries (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        summary TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create the tour_guides table
    await query(`
      CREATE TABLE IF NOT EXISTS tour_guides (
        id SERIAL PRIMARY KEY,
        host_id INTEGER NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        photo TEXT,
        specialty VARCHAR(255) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create the package_guides table
    // Assigns which of a host's tour guides are attached to a package.
    await query(`
      CREATE TABLE IF NOT EXISTS package_guides (
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        tour_guide_id INTEGER NOT NULL REFERENCES tour_guides(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (package_id, tour_guide_id)
      );
    `);

    // Create the sos_alerts table
    // Stores emergency alerts with honest delivery status transitions:
    // Pending (queued locally) -> Sent (server received) -> Delivered
    // (recipient confirmed) or Failed (could not transmit).
    await query(`
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

    // ============================================================
    // CENTRALIZED MARKETPLACE COMMUNICATION SYSTEM
    // ============================================================

    // Conversation container between one Traveler and one Host
    await query(`
      CREATE TABLE IF NOT EXISTS marketplace_chats (
        id SERIAL PRIMARY KEY,

        conversation_id VARCHAR(255) UNIQUE NOT NULL,

        traveler_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        host_id INTEGER NOT NULL
          REFERENCES hosts(id)
          ON DELETE CASCADE,

        last_message_snippet TEXT,

        updated_at TIMESTAMP DEFAULT NOW(),

        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

       // Existing messages table is preserved for backward compatibility.
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,

        sender_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        receiver_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        content TEXT NOT NULL,

        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

// Add centralized messaging columns to existing installations.
// These statements are intentionally additive so existing data is not lost.
    await query(`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(255);
    `);

    await query(`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS associated_package_id INTEGER
      REFERENCES packages(id)
      ON DELETE SET NULL;
    `);

    await query(`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
    `);

    await query(`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS message_text TEXT;
    `);

 // Existing prototype messages remain usable.
    await query(`
      UPDATE messages
      SET message_text = content
      WHERE message_text IS NULL;
    `);

    /* ------------------------------------------------------------------ */
    /* MODERATION - reports raised by users against content or hosts      */
    /* ------------------------------------------------------------------ */

    await query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR(20) NOT NULL,
        target_id INTEGER NOT NULL,
        reason VARCHAR(60) NOT NULL,
        details TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        resolution_note TEXT,
        resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT reports_target_type_check
          CHECK (target_type IN ('review', 'package', 'user', 'host')),
        CONSTRAINT reports_status_check
          CHECK (status IN ('open', 'resolved', 'dismissed'))
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
      ON reports(reporter_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reports_resolved_by
      ON reports(resolved_by);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reports_target
      ON reports(target_type, target_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reports_status_created
      ON reports(status, created_at DESC);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reports_open_created
      ON reports(created_at DESC)
      WHERE status = 'open';
    `);

    // One open report per reporter per target - blocks duplicate spam.
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_open_target
      ON reports(reporter_id, target_type, target_id)
      WHERE status = 'open';
    `);

    // Immutable audit trail of every admin mutation (role changes,
    // verification decisions, deletions, report resolutions).
    // actor_email is denormalized so the trail survives user deletion.
    await query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        actor_email VARCHAR(255),
        action VARCHAR(60) NOT NULL,
        target_type VARCHAR(30) NOT NULL,
        target_id INTEGER,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created
      ON admin_audit_log(created_at DESC);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor
      ON admin_audit_log(actor_id, created_at DESC);
    `);

    // Dashboard counts hosts with verification_status = 'pending' on
    // every load - partial index keeps it tiny.
    await query(`
      CREATE INDEX IF NOT EXISTS idx_hosts_verification_pending
      ON hosts(verification_status)
      WHERE verification_status = 'pending';
    `);

// Performance indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_chats_traveler
      ON marketplace_chats(traveler_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_chats_host
      ON marketplace_chats(host_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_chats_updated
      ON marketplace_chats(updated_at DESC);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation
      ON messages(conversation_id, created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_unread
      ON messages(receiver_id, is_read);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_package
      ON messages(associated_package_id);
    `);

    // Create indexes for performance
    await query('CREATE INDEX IF NOT EXISTS idx_packages_host_id ON packages(host_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_packages_destination_id ON packages(destination_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_package_id ON reviews(package_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);');
    await query('CREATE INDEX IF NOT EXISTS idx_tour_guides_host_id ON tour_guides(host_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_package_guides_tour_guide_id ON package_guides(tour_guide_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);');

    // Branding columns for existing databases created before they existed.
    await query('ALTER TABLE hosts ADD COLUMN IF NOT EXISTS logo_url TEXT;');
    await query('ALTER TABLE hosts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;');

    // User profile photo for existing databases created before it existed.
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');

    // Additional performance indexes used by dashboard/admin/booking flows.
    await query('CREATE INDEX IF NOT EXISTS idx_hosts_user_id ON hosts(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);');
    await query('CREATE INDEX IF NOT EXISTS idx_review_summaries_package_id ON review_summaries(package_id);');

    // A traveler can review a given package exactly once. Controller already
    // blocks duplicates via a 409, but enforce it at the DB level too. On
    // legacy databases that accumulated duplicates, keep the earliest review
    // and drop the rest before creating the unique index.
    await query(`
      DELETE FROM reviews r
      USING reviews r2
      WHERE r.id > r2.id
        AND r.user_id = r2.user_id
        AND r.package_id = r2.package_id;
    `);
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_user_package
      ON reviews(user_id, package_id);
    `);

    console.log('Database schema setup completed successfully.');
  } catch (err) {
    console.error('Error setting up database schema:', err);
    throw err;
  }
}

module.exports = { setupSchema };