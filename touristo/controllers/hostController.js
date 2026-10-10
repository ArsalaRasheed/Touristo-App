const Host = require('../models/Host');
const { query } = require('../config/database');
const { getHostWithRanking, getAllHostsWithRanking } = require('../utils/hostRanking');
const { sanitizeHost, isAdmin } = require('../middleware/accessControl');
const {
  uploadHostImage,
  PackageImageValidationError,
  PackageImageStorageError
} = require('../utils/packageStorage');

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * Real completed-trip count for a host - never randomised.
 */
const getCompletedTrips = async (hostId) => {
  try {
    const result = await query(
      `SELECT COUNT(*)::int AS trips
         FROM bookings b
         JOIN packages p ON p.id = b.package_id
        WHERE p.host_id = $1 AND b.status = 'completed'`,
      [hostId]
    );
    return result.rows[0]?.trips || 0;
  } catch (err) {
    console.warn('Could not load host trip count:', err.message);
    return 0;
  }
};

const hostController = {
  // Get all hosts
  async getAllHosts(req, res) {
    try {
      // Use the ranking utility to get all hosts with their rankings
      const hosts = await getAllHostsWithRanking();

      // Real trip counts from completed bookings (never invented)
      let tripCounts = new Map();

      try {
        const counts = await query(`
          SELECT
            p.host_id,
            SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END)::int AS trips
          FROM packages p
          LEFT JOIN bookings b ON b.package_id = p.id
          GROUP BY p.host_id
        `);

        tripCounts = new Map(
          counts.rows.map(row => [row.host_id, row.trips])
        );
      } catch (countErr) {
        console.warn('Could not load host trip counts:', countErr.message);
      }

      // Add ranking numbers to hosts (top 3 get special positions)
      const hostsWithRankingNumbers = hosts.map((host, index) => ({
        ...sanitizeHost(host, req),
        ranking: index + 1,
        trips_completed: tripCounts.get(host.id) || 0
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
        message: 'Something went wrong. Please try again.',
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
        ...sanitizeHost(hostWithRanking, req),
        tourGuides: tourGuides,
        packages: packagesWithBookings,
        packageCount: packagesWithBookings.length,
        trips_completed: await getCompletedTrips(host.id)
      };

      res.status(200).json({
        status: 'success',
        data: { host: hostWithData },
      });
    } catch (err) {
      console.error('Error in getHostById:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
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
        ...sanitizeHost(hostWithRanking, req),
        tourGuides: tourGuides,
        packages: packagesWithBookings,
        packageCount: packagesWithBookings.length,
        trips_completed: await getCompletedTrips(host.id)
      };

      res.status(200).json({
        status: 'success',
        data: { host: hostWithData },
      });
    } catch (err) {
      console.error('Error in getHostByUserId:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  /**
   * Create a host profile.
   *
   * The owning user is ALWAYS the authenticated caller - a client-supplied
   * `user_id` is ignored. One host profile per user.
   */
  async createHost(req, res) {
    try {
      const user_id = req.user.id;
      const { company_name, description, location, license_number, cnic_or_business_registration, company_address } = req.body;

      // Validate required fields
      if (!company_name || !String(company_name).trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Company name is required',
        });
      }

      const existing = await Host.findByUserId(user_id);
      if (existing) {
        return res.status(409).json({
          status: 'fail',
          message: 'You already have a company profile',
        });
      }

      const newHost = await Host.create({
        user_id,
        company_name: String(company_name).trim(),
        description,
        location,
        license_number,
        cnic_or_business_registration,
        company_address
      });

      // A user who creates a company profile becomes a host.
      // Admins keep their role.
      if (req.user.role === 'traveler') {
        await query(
          `UPDATE users SET role = 'host', updated_at = NOW() WHERE id = $1 AND role = 'traveler'`,
          [user_id]
        ).catch((err) => console.warn('Could not promote user role:', err.message));
      }

      res.status(201).json({
        status: 'success',
        data: { host: newHost },
      });
    } catch (err) {
      console.error('Error in createHost:', err);
      res.status(500).json({
        status: 'error',
        message: GENERIC_ERROR,
      });
    }
  },

  // Update host
  async updateHost(req, res) {
    try {
      const { id } = req.params;

      const existing = await Host.findById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      const isOwner =
        Number(existing.user_id) === Number(req.user?.id);
      const isAdmin = req.user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          status: 'fail',
          message:
            'You are not authorized to update this host profile',
        });
      }

      const {
        company_name,
        description,
        location,
        license_number,
        cnic_or_business_registration,
        company_address,
      } = req.body || {};

      const pickText = (value, current) =>
        typeof value === 'string' ? value : current;

      const updatedHost = await Host.update(id, {
        company_name:
          typeof company_name === 'string' &&
          company_name.trim()
            ? company_name.trim()
            : existing.company_name,

        description: pickText(
          description,
          existing.description
        ),

        location: pickText(
          location,
          existing.location
        ),

        license_number: pickText(
          license_number,
          existing.license_number
        ),

        cnic_or_business_registration:
          pickText(
            cnic_or_business_registration,
            existing.cnic_or_business_registration
          ),

        company_address: pickText(
          company_address,
          existing.company_address
        ),

        // Branding images are managed by the dedicated upload
        // endpoint; preserve whatever is already stored.
        logo_url: existing.logo_url,

        cover_image_url: existing.cover_image_url,

        // Verification is admin controlled only and can never be
        // set from this endpoint, regardless of the request body.
        verification_status:
          existing.verification_status || 'pending',

        verified: existing.verified === true,
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
        message: 'Something went wrong. Please try again.',
      });
    }
  },

  // Upload or replace a host branding image (logo or cover photo)
  async uploadHostBrandingImage(req, res) {
    try {
      const { id } = req.params;

      const existing = await Host.findById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      const isOwner =
        Number(existing.user_id) === Number(req.user?.id);

      if (!isOwner && !isAdmin(req)) {
        return res.status(403).json({
          status: 'fail',
          message:
            'You are not authorized to update this host profile',
        });
      }

      const {
        kind,
        image_data,
        image_name,
        image_type,
      } = req.body || {};

      if (kind !== 'logo' && kind !== 'cover') {
        return res.status(400).json({
          status: 'fail',
          message: "Image kind must be either 'logo' or 'cover'",
        });
      }

      const uploaded = await uploadHostImage({
        imageData: image_data,
        imageName: image_name,
        imageType: image_type,
        kind,
      });

      const column =
        kind === 'cover' ? 'cover_image_url' : 'logo_url';

      const result = await query(
        `UPDATE hosts SET ${column} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [uploaded.url, id]
      );

      res.status(200).json({
        status: 'success',
        data: {
          host: sanitizeHost(new Host(result.rows[0]), req),
          image_url: uploaded.url,
          kind,
        },
      });
    } catch (err) {
      if (err instanceof PackageImageValidationError) {
        return res.status(400).json({
          status: 'fail',
          message: err.message,
        });
      }

      if (err instanceof PackageImageStorageError) {
        console.error(
          'Host branding image storage error:',
          err.message
        );
        return res.status(502).json({
          status: 'error',
          message:
            'Could not store the image right now. Please try again.',
        });
      }

      console.error('Error in uploadHostBrandingImage:', err);
      res.status(500).json({
        status: 'error',
        message: GENERIC_ERROR,
      });
    }
  },

  // Delete host
  async deleteHost(req, res) {
    try {
      const { id } = req.params;

      const existing = await Host.findById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: 'Host not found',
        });
      }

      const isOwner =
        Number(existing.user_id) === Number(req.user?.id);
      const isAdmin = req.user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          status: 'fail',
          message:
            'You are not authorized to delete this host profile',
        });
      }

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
        message: 'Something went wrong. Please try again.',
      });
    }
  }
};

module.exports = hostController;