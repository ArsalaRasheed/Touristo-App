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
        availability_start DATE,
        availability_end DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('Executing command:', createPackagesTable);
    await query(createPackagesTable);

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
    await query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);');

    console.log('Database schema setup completed successfully.');
  } catch (err) {
    console.error('Error setting up database schema:', err);
    throw err;
  }
}

module.exports = { setupSchema };