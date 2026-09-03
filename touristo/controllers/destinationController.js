const { query } = require('../config/database');

const destinationController = {
  // Get all destinations
  async getAllDestinations(req, res) {
    try {
      const result = await query(`
        SELECT id, name, category, history, culture, famous_spots, famous_food, latitude, longitude
        FROM destinations
        ORDER BY name ASC
      `);
      
      res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: { destinations: result.rows },
      });
    } catch (err) {
      console.error('Error in getAllDestinations:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get destination by ID
  async getDestinationById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await query(`
        SELECT id, name, category, history, culture, famous_spots, famous_food, latitude, longitude
        FROM destinations
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Destination not found',
        });
      }
      
      const destination = result.rows[0];
      
      // Get packages for this destination
      const packagesResult = await query(`
        SELECT p.id, p.title, p.description, p.price, p.duration_days, p.image, p.location,
               h.company_name as host_name, h.verified as host_verified, h.rating_score as host_rating
        FROM packages p
        LEFT JOIN hosts h ON p.host_id = h.id
        WHERE p.destination_id = $1
      `, [id]);
      
      res.status(200).json({
        status: 'success',
        data: { 
          destination: destination,
          packages: packagesResult.rows 
        },
      });
    } catch (err) {
      console.error('Error in getDestinationById:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get destination by name
  async getDestinationByName(req, res) {
    try {
      const { name } = req.params;
      
      const result = await query(`
        SELECT id, name, category, history, culture, famous_spots, famous_food, latitude, longitude
        FROM destinations
        WHERE LOWER(name) = LOWER($1)
      `, [name]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Destination not found',
        });
      }
      
      const destination = result.rows[0];
      
      // Get packages for this destination
      const packagesResult = await query(`
        SELECT p.id, p.title, p.description, p.price, p.duration_days, p.image, p.location,
               h.company_name as host_name, h.verified as host_verified, h.rating_score as host_rating
        FROM packages p
        LEFT JOIN hosts h ON p.host_id = h.id
        WHERE p.destination_id = $1
      `, [destination.id]);
      
      res.status(200).json({
        status: 'success',
        data: { 
          destination: destination,
          packages: packagesResult.rows 
        },
      });
    } catch (err) {
      console.error('Error in getDestinationByName:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  }
};

module.exports = destinationController;