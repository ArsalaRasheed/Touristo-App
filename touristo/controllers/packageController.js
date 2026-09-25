const Package = require('../models/Package');
const { query } = require('../config/database');

const packageController = {

  // Get all packages
  async getAllPackages(req, res) {
    try {
      const packages = await Package.findAll();

      res.status(200).json({
        status: 'success',
        results: packages.length,
        data: { packages },
      });
    } catch (err) {
      console.error('Error in getAllPackages:', err);

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get package by ID
  async getPackageById(req, res) {
    try {
      const { id } = req.params;

      const pkg = await Package.findById(id);

      if (!pkg) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found',
        });
      }

      const reviewsResult = await query(`
        SELECT
          r.id,
          r.user_id,
          r.rating,
          r.comment,
          r.created_at,
          u.name AS reviewer_name
        FROM reviews r
        JOIN users u
          ON r.user_id = u.id
        WHERE package_id = $1
        ORDER BY created_at DESC
      `, [id]);

      const ratingsResult = await query(`
        SELECT
          AVG(rating) AS avg_rating,
          COUNT(*) AS total_reviews
        FROM reviews
        WHERE package_id = $1
      `, [id]);

      const avgRating =
        parseFloat(
          ratingsResult.rows[0]?.avg_rating
        ) || 0;

      const totalReviews =
        parseInt(
          ratingsResult.rows[0]?.total_reviews
        ) || 0;

      const {
        generateAndCacheSummary,
        getCachedSummary
      } = require('../utils/reviewSummarizer');

      let reviewSummary = null;

      try {
        reviewSummary =
          await getCachedSummary(id);

        if (!reviewSummary) {
          reviewSummary =
            await generateAndCacheSummary(id);
        }
      } catch (summaryErr) {
        console.error(
          'Error getting review summary:',
          summaryErr
        );
      }

      const packageWithData = {
        ...pkg,
        reviews: reviewsResult.rows,
        avg_rating: avgRating,
        total_reviews: totalReviews,
        group_size: pkg.group_size
      };

      res.status(200).json({
        status: 'success',
        data: {
          package: packageWithData,
          reviewSummary
        },
      });

    } catch (err) {
      console.error(
        'Error in getPackageById:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get packages by host ID
  async getPackagesByHostId(req, res) {
    try {
      const { hostId } = req.params;

      const packages =
        await Package.findByHostId(hostId);

      const packagesWithBookings =
        await Promise.all(
          packages.map(async pkg => {
            const bookingCountResult =
              await query(
                `
                  SELECT COUNT(*) AS count
                  FROM bookings
                  WHERE package_id = $1
                `,
                [pkg.id]
              );

            return {
              ...pkg,
              booking_count:
                parseInt(
                  bookingCountResult.rows[0]?.count
                ) || 0
            };
          })
        );

      res.status(200).json({
        status: 'success',
        results: packagesWithBookings.length,
        data: {
          packages: packagesWithBookings
        },
      });

    } catch (err) {
      console.error(
        'Error in getPackagesByHostId:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Get packages by destination ID
  async getPackagesByDestinationId(req, res) {
    try {
      const { destinationId } = req.params;

      const packages =
        await Package.findByDestinationId(
          destinationId
        );

      res.status(200).json({
        status: 'success',
        results: packages.length,
        data: { packages },
      });

    } catch (err) {
      console.error(
        'Error in getPackagesByDestinationId:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Create a new package
  async createPackage(req, res) {
    try {
      const {
        host_id,
        destination_id,
        title,
        description,
        price,
        duration_days,
        location,
        image,
        destination,
        inclusions,
        exclusions,
        itinerary,
        group_size,
        availability_start,
        availability_end
      } = req.body;

      // --------------------------------------------------
      // BASIC VALIDATION
      // --------------------------------------------------

      const parsedHostId =
        Number(host_id);

      if (
        !Number.isInteger(parsedHostId) ||
        parsedHostId <= 0
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Host ID must be a positive integer',
        });
      }

      if (
        !title ||
        typeof title !== 'string' ||
        !title.trim()
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Package title is required',
        });
      }

      const parsedPrice =
        Number(price);

      if (
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Price must be a valid non-negative number',
        });
      }

      // --------------------------------------------------
      // DURATION
      // --------------------------------------------------

      let sanitizedDuration = null;

      if (
        duration_days !== undefined &&
        duration_days !== null &&
        duration_days !== ''
      ) {
        sanitizedDuration =
          Number(duration_days);

        if (
          !Number.isInteger(
            sanitizedDuration
          ) ||
          sanitizedDuration <= 0
        ) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Duration must be a positive integer',
          });
        }
      }

      // --------------------------------------------------
      // DESTINATION
      //
      // If frontend sends destination_id,
      // use it.
      //
      // Otherwise find/create destination
      // using the destination text.
      // --------------------------------------------------

      let resolvedDestinationId =
        destination_id
          ? Number(destination_id)
          : null;

      let destinationName =
        typeof destination === 'string'
          ? destination.trim()
          : '';

      if (
        resolvedDestinationId &&
        !Number.isInteger(
          resolvedDestinationId
        )
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Destination ID must be a valid integer',
        });
      }

      if (!resolvedDestinationId) {

        if (!destinationName) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Destination is required',
          });
        }

        // Find existing destination
        const existingDestination =
          await query(
            `
              SELECT id, name
              FROM destinations
              WHERE LOWER(TRIM(name))
                    = LOWER(TRIM($1))
              LIMIT 1
            `,
            [destinationName]
          );

        if (
          existingDestination.rows.length > 0
        ) {
          resolvedDestinationId =
            existingDestination.rows[0].id;

          destinationName =
            existingDestination.rows[0].name;
        } else {

          // Create destination if it doesn't exist.
          // Coordinates remain NULL until the
          // destination is properly geo-located.
          const newDestination =
            await query(
              `
                INSERT INTO destinations (
                  name
                )
                VALUES ($1)
                RETURNING id, name
              `,
              [destinationName]
            );

          resolvedDestinationId =
            newDestination.rows[0].id;

          destinationName =
            newDestination.rows[0].name;
        }

      } else {

        // Verify destination ID exists
        const destinationResult =
          await query(
            `
              SELECT id, name
              FROM destinations
              WHERE id = $1
              LIMIT 1
            `,
            [resolvedDestinationId]
          );

        if (
          destinationResult.rows.length === 0
        ) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Selected destination does not exist',
          });
        }

        if (!destinationName) {
          destinationName =
            destinationResult.rows[0].name;
        }
      }

      // --------------------------------------------------
      // SANITIZE OTHER FIELDS
      // --------------------------------------------------

      const sanitizedTitle =
        title.trim();

      const sanitizedDescription =
        typeof description === 'string'
          ? description.trim().substring(0, 5000)
          : null;

      const sanitizedLocation =
        typeof location === 'string'
          ? location.trim()
          : destinationName;

      const sanitizedImage =
        typeof image === 'string' &&
        image.trim()
          ? image.trim()
          : null;

      // --------------------------------------------------
      // ARRAY FIELDS
      // --------------------------------------------------

      let sanitizedInclusions = [];

      if (Array.isArray(inclusions)) {
        sanitizedInclusions =
          inclusions
            .map(item =>
              typeof item === 'string'
                ? item.trim()
                : String(item)
            )
            .filter(Boolean);
      }

      let sanitizedExclusions = [];

      if (Array.isArray(exclusions)) {
        sanitizedExclusions =
          exclusions
            .map(item =>
              typeof item === 'string'
                ? item.trim()
                : String(item)
            )
            .filter(Boolean);
      }

      // --------------------------------------------------
      // ITINERARY
      // --------------------------------------------------

      let sanitizedItinerary =
        itinerary ?? null;

      if (
        typeof sanitizedItinerary === 'string' &&
        sanitizedItinerary.trim()
      ) {
        try {
          sanitizedItinerary =
            JSON.parse(
              sanitizedItinerary
            );
        } catch (parseError) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Itinerary must contain valid JSON',
          });
        }
      }

      // --------------------------------------------------
      // GROUP SIZE
      // --------------------------------------------------

      const sanitizedGroupSize =
        typeof group_size === 'string'
          ? group_size.trim()
          : group_size ?? null;

      // --------------------------------------------------
      // CREATE PACKAGE
      // --------------------------------------------------

      const newPackage =
        await Package.create({
          host_id: parsedHostId,

          destination_id:
            resolvedDestinationId,

          title:
            sanitizedTitle,

          description:
            sanitizedDescription,

          price:
            parsedPrice,

          duration_days:
            sanitizedDuration,

          location:
            sanitizedLocation,

          image:
            sanitizedImage,

          destination:
            destinationName,

          inclusions:
            sanitizedInclusions,

          exclusions:
            sanitizedExclusions,

          itinerary:
            sanitizedItinerary,

          group_size:
            sanitizedGroupSize,

          availability_start,
          availability_end
        });

      res.status(201).json({
        status: 'success',
        data: {
          package: newPackage
        },
      });

    } catch (err) {

      console.error(
        'Error in createPackage:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Update package
  async updatePackage(req, res) {
    try {
      const { id } = req.params;

      const {
        title,
        description,
        price,
        duration_days,
        location,
        image,
        destination_id,
        destination,
        inclusions,
        exclusions,
        itinerary,
        group_size,
        availability_start,
        availability_end
      } = req.body;

      let resolvedDestinationId =
        destination_id
          ? Number(destination_id)
          : null;

      let destinationName =
        typeof destination === 'string'
          ? destination.trim()
          : '';

      // Resolve destination for update
      if (!resolvedDestinationId && destinationName) {

        const existingDestination =
          await query(
            `
              SELECT id, name
              FROM destinations
              WHERE LOWER(TRIM(name))
                    = LOWER(TRIM($1))
              LIMIT 1
            `,
            [destinationName]
          );

        if (
          existingDestination.rows.length > 0
        ) {
          resolvedDestinationId =
            existingDestination.rows[0].id;

          destinationName =
            existingDestination.rows[0].name;
        } else {

          const newDestination =
            await query(
              `
                INSERT INTO destinations (name)
                VALUES ($1)
                RETURNING id, name
              `,
              [destinationName]
            );

          resolvedDestinationId =
            newDestination.rows[0].id;

          destinationName =
            newDestination.rows[0].name;
        }
      }

      let parsedPrice =
        Number(price);

      if (
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Price must be a valid non-negative number',
        });
      }

      let parsedDuration =
        duration_days;

      if (
        duration_days !== undefined &&
        duration_days !== null &&
        duration_days !== ''
      ) {
        parsedDuration =
          Number(duration_days);

        if (
          !Number.isInteger(
            parsedDuration
          ) ||
          parsedDuration <= 0
        ) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Duration must be a positive integer',
          });
        }
      }

      let parsedItinerary =
        itinerary ?? null;

      if (
        typeof parsedItinerary === 'string' &&
        parsedItinerary.trim()
      ) {
        try {
          parsedItinerary =
            JSON.parse(parsedItinerary);
        } catch {
          return res.status(400).json({
            status: 'fail',
            message:
              'Itinerary must contain valid JSON',
          });
        }
      }

      const updatedPackage =
        await Package.update(id, {
          title:
            typeof title === 'string'
              ? title.trim()
              : title,

          description:
            typeof description === 'string'
              ? description.trim()
              : description,

          price:
            parsedPrice,

          duration_days:
            parsedDuration,

          location:
            typeof location === 'string'
              ? location.trim()
              : location,

          image:
            typeof image === 'string'
              ? image.trim()
              : image,

          destination_id:
            resolvedDestinationId,

          destination:
            destinationName ||
            destination,

          inclusions:
            Array.isArray(inclusions)
              ? inclusions
              : [],

          exclusions:
            Array.isArray(exclusions)
              ? exclusions
              : [],

          itinerary:
            parsedItinerary,

          group_size:
            typeof group_size === 'string'
              ? group_size.trim()
              : group_size,

          availability_start,
          availability_end
        });

      if (!updatedPackage) {
        return res.status(404).json({
          status: 'fail',
          message:
            'Package not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          package: updatedPackage
        },
      });

    } catch (err) {

      console.error(
        'Error in updatePackage:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },

  // Delete package
  async deletePackage(req, res) {
    try {
      const { id } = req.params;

      const deleted =
        await Package.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message:
            'Package not found',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });

    } catch (err) {

      console.error(
        'Error in deletePackage:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  }
};

module.exports = packageController;