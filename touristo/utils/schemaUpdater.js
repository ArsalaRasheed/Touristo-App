require('dotenv').config(); // Load environment variables
const { query } = require('../config/database');

// Function to add travelers column to bookings table if it doesn't exist
const addTravelersColumn = async () => {
  try {
    // Check if the column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'travelers';
    `;
    
    const result = await query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      // Column doesn't exist, so add it
      console.log('Adding travelers column to bookings table...');
      const alterTableQuery = `
        ALTER TABLE bookings 
        ADD COLUMN travelers INTEGER DEFAULT 1;
      `;
      await query(alterTableQuery);
      console.log('Successfully added travelers column to bookings table');
    } else {
      console.log('Travelers column already exists in bookings table');
    }
  } catch (err) {
    console.error('Error updating schema:', err.message);
    throw err;
  }
};

module.exports = {
  addTravelersColumn
};