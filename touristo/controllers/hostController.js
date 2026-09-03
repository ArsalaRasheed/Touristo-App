const Host = require('../models/Host');
const { query } = require('../config/database');
const { getHostWithRanking, getAllHostsWithRanking } = require('../utils/hostRanking');

const hostController = {
  // Get all hosts
  async getAllHosts(req, res) {
    try {
      // Use the ranking utility to get all hosts with their rankings
      const hosts = await getAllHostsWithRanking();
      
      // Add ranking numbers to hosts (top 3 get special positions)
      const hostsWithRankingNumbers = hosts.map((host, index) => ({
        ...host,
        ranking: index + 1,
        trips_completed: Math.floor(Math.random() * 300) // Mock data for number of trips
      }));
      
      res.status(200).json({
        status: 'success',
        results: hostsWithRankingNumbers.length,
        data: { hosts: hostsWithRankingNumbers },
      });
    } catch (err) {
      console.error('Error in getAllHosts:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get host by ID
  async getHostById(req, res) {
    try {
      const { id } = req.params;
      const host = await Host.findById(id);

      if (!host) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      // Get the host with ranking information
      const hostWithRanking = await getHostWithRanking(id);
      
      if (!hostWithRanking) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      // Get tour guides for this host
      const TourGuide = require('../models/TourGuide');
      const tourGuides = await Host.getTourGuidesByHostId(id);

      // Get packages for this host
      const packagesResult = await query(`
        SELECT id, title, price, duration_days, image, group_size
        FROM packages
        WHERE host_id = $1
      `, [id]);
      
      // Get booking count for each package
      const packagesWithBookings = await Promise.all(packagesResult.rows.map(async (pkg) => {
        const bookingCountResult = await query(
          'SELECT COUNT(*) as count FROM bookings WHERE package_id = $1',
          [pkg.id]
        );
        return {
          ...pkg,
          bookings: parseInt(bookingCountResult.rows[0]?.count) || 0
        };
      }));

      // Add tour guides and packages to host data
      const hostWithData = {
        ...hostWithRanking,
        tourGuides: tourGuides,
        packages: packagesWithBookings,
        packageCount: packagesWithBookings.length,
        trips_completed: Math.floor(Math.random() * 300) // Mock data for number of trips
      };

      res.status(200).json({
        status: 'success',
        data: { host: hostWithData },
      });
    } catch (err) {
      console.error('Error in getHostById:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get host by user ID
  async getHostByUserId(req, res) {
    try {
      const { id } = req.params;
      const host = await Host.findByUserId(id);

      if (!host) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      // Get the host with ranking information
      const hostWithRanking = await getHostWithRanking(host.id);
      
      if (!hostWithRanking) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      // Get tour guides for this host
      const TourGuide = require('../models/TourGuide');
      const tourGuides = await Host.getTourGuidesByHostId(host.id);

      // Get packages for this host
      const packagesResult = await query(`
        SELECT id, title, price, duration_days, image, group_size
        FROM packages
        WHERE host_id = $1
      `, [host.id]);
      
      // Get booking count for each package
      const packagesWithBookings = await Promise.all(packagesResult.rows.map(async (pkg) => {
        const bookingCountResult = await query(
          'SELECT COUNT(*) as count FROM bookings WHERE package_id = $1',
          [pkg.id]
        );
        return {
          ...pkg,
          bookings: parseInt(bookingCountResult.rows[0]?.count) || 0
        };
      }));

      // Add tour guides and packages to host data
      const hostWithData = {
        ...hostWithRanking,
        tourGuides: tourGuides,
        packages: packagesWithBookings,
        packageCount: packagesWithBookings.length,
        trips_completed: Math.floor(Math.random() * 300) // Mock data for number of trips
      };

      res.status(200).json({
        status: 'success',
        data: { host: hostWithData },
      });
    } catch (err) {
      console.error('Error in getHostByUserId:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new host
  async createHost(req, res) {
    try {
      const { user_id, company_name, description, location, license_number, cnic_or_business_registration, company_address } = req.body;

      // Validate required fields
      if (!user_id || !company_name) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID and company name are required',
        });
      }

      const newHost = await Host.create({
        user_id,
        company_name,
        description,
        location,
        license_number,
        cnic_or_business_registration,
        company_address
      });

      res.status(201).json({
        status: 'success',
        data: { host: newHost },
      });
    } catch (err) {
      console.error('Error in createHost:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Update host
  async updateHost(req, res) {
    try {
      const { id } = req.params;
      const { company_name, description, location, license_number, cnic_or_business_registration, company_address, verification_status, verified } = req.body;

      const updatedHost = await Host.update(id, {
        company_name,
        description,
        location,
        license_number,
        cnic_or_business_registration,
        company_address,
        verification_status,
        verified
      });

      if (!updatedHost) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: { host: updatedHost },
      });
    } catch (err) {
      console.error('Error in updateHost:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete host
  async deleteHost(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Host.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      console.error('Error in deleteHost:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  }
};

module.exports = hostController;