const Package = require('../models/Package');
const { query } = require('../config/database');

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeText(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map(item =>
        typeof item === 'string'
          ? item.trim()
          : item
      )
      .filter(item => item !== '');
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Convert itinerary input into JSONB-safe structure
|--------------------------------------------------------------------------
|
| Accepts:
|
| 1. Already-valid JSON
| 2. JSON string
| 3. Normal textarea text
|
| Example normal text:
|
| Day 1: Arrival in Islamabad
| Visit Faisal Mosque.
|
| Day 2: Islamabad Tour
| Visit Daman-e-Koh.
|
|--------------------------------------------------------------------------
*/

function normalizeItinerary(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return [];
  }

  // Already an array/object
  if (
    Array.isArray(value) ||
    typeof value === 'object'
  ) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  const text = value.trim();

  if (!text) {
    return [];
  }

  /*
   * First try proper JSON.
   */
  try {
    const parsed = JSON.parse(text);

    if (
      Array.isArray(parsed) ||
      typeof parsed === 'object'
    ) {
      return parsed;
    }
  } catch {
    // Not JSON.
    // Continue and convert normal text.
  }

  /*
   * Convert normal textarea content into
   * day-by-day itinerary objects.
   */

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const days = [];

  let currentDay = null;

  for (const line of lines) {

    /*
     * Recognize:
     *
     * Day 1
     * Day 1:
     * Day 1 - Arrival
     * Day 1: Arrival
     * day 2 - Islamabad Tour
     */
    const dayMatch = line.match(
      /^day\s*(\d+)\s*(?:[:\-–—]\s*(.*))?$/i
    );

    if (dayMatch) {

      if (currentDay) {
        days.push(currentDay);
      }

      const dayNumber =
        Number(dayMatch[1]);

      const heading =
        dayMatch[2]?.trim() || '';

      currentDay = {
        day: dayNumber,
        title:
          heading ||
          `Day ${dayNumber}`,
        description: ''
      };

      continue;
    }

    /*
     * If no "Day X" heading exists yet,
     * put the content into Day 1.
     */
    if (!currentDay) {
      currentDay = {
        day: 1,
        title: 'Itinerary',
        description: line
      };

      continue;
    }

    /*
     * Add subsequent lines to the
     * current day's description.
     */
    currentDay.description =
      currentDay.description
        ? `${currentDay.description} ${line}`
        : line;
  }

  if (currentDay) {
    days.push(currentDay);
  }

  /*
   * If the parser somehow produced nothing,
   * preserve the text rather than losing it.
   */
  if (days.length === 0) {
    return [
      {
        day: 1,
        title: 'Itinerary',
        description: text
      }
    ];
  }

  return days;
}

/*
|--------------------------------------------------------------------------
| Package Controller
|--------------------------------------------------------------------------
*/

const packageController = {

  /*
  |--------------------------------------------------------------------------
  | Get all packages
  |--------------------------------------------------------------------------
  */

  async getAllPackages(req, res) {
    try {

      const packages =
        await Package.findAll();

      res.status(200).json({
        status: 'success',
        results: packages.length,
        data: {
          packages
        }
      });

    } catch (err) {

      console.error(
        'Error in getAllPackages:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get package by ID
  |--------------------------------------------------------------------------
  */

  async getPackageById(req, res) {
    try {

      const { id } = req.params;

      const pkg =
        await Package.findById(id);

      if (!pkg) {
        return res.status(404).json({
          status: 'fail',
          message: 'Package not found'
        });
      }

      /*
       * Reviews
       */
      const reviewsResult =
        await query(
          `
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
            WHERE r.package_id = $1
            ORDER BY r.created_at DESC
          `,
          [id]
        );

      /*
       * Rating summary
       */
      const ratingsResult =
        await query(
          `
            SELECT
              AVG(rating) AS avg_rating,
              COUNT(*) AS total_reviews
            FROM reviews
            WHERE package_id = $1
          `,
          [id]
        );

      const avgRating =
        parseFloat(
          ratingsResult.rows[0]?.avg_rating
        ) || 0;

      const totalReviews =
        parseInt(
          ratingsResult.rows[0]?.total_reviews
        ) || 0;

      /*
       * AI review summary
       */
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
        reviews:
          reviewsResult.rows,
        avg_rating:
          avgRating,
        total_reviews:
          totalReviews,
        group_size:
          pkg.group_size
      };

      res.status(200).json({
        status: 'success',
        data: {
          package:
            packageWithData,
          reviewSummary
        }
      });

    } catch (err) {

      console.error(
        'Error in getPackageById:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get packages by host
  |--------------------------------------------------------------------------
  */

  async getPackagesByHostId(req, res) {
    try {

      const { hostId } =
        req.params;

      const packages =
        await Package.findByHostId(
          hostId
        );

      const packagesWithBookings =
        await Promise.all(
          packages.map(
            async pkg => {

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
                    bookingCountResult
                      .rows[0]?.count
                  ) || 0
              };
            }
          )
        );

      res.status(200).json({
        status: 'success',
        results:
          packagesWithBookings.length,
        data: {
          packages:
            packagesWithBookings
        }
      });

    } catch (err) {

      console.error(
        'Error in getPackagesByHostId:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get packages by destination
  |--------------------------------------------------------------------------
  */

  async getPackagesByDestinationId(
    req,
    res
  ) {
    try {

      const { destinationId } =
        req.params;

      const packages =
        await Package.findByDestinationId(
          destinationId
        );

      res.status(200).json({
        status: 'success',
        results:
          packages.length,
        data: {
          packages
        }
      });

    } catch (err) {

      console.error(
        'Error in getPackagesByDestinationId:',
        err
      );

      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Create Package
  |--------------------------------------------------------------------------
  */

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

      /*
       * ------------------------------------------------------
       * HOST
       * ------------------------------------------------------
       */

      const parsedHostId =
        Number(host_id);

      if (
        !Number.isInteger(
          parsedHostId
        ) ||
        parsedHostId <= 0
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Host ID must be a positive integer'
        });
      }

      /*
       * ------------------------------------------------------
       * TITLE
       * ------------------------------------------------------
       */

      if (
        typeof title !== 'string' ||
        !title.trim()
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Package title is required'
        });
      }

      const sanitizedTitle =
        title.trim();

      /*
       * ------------------------------------------------------
       * PRICE
       * ------------------------------------------------------
       */

      const parsedPrice =
        Number(price);

      if (
        !Number.isFinite(
          parsedPrice
        ) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Price must be a valid non-negative number'
        });
      }

      /*
       * ------------------------------------------------------
       * DURATION
       * ------------------------------------------------------
       */

      let sanitizedDuration = null;

      if (
        duration_days !==
          undefined &&
        duration_days !==
          null &&
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
              'Duration must be a positive integer'
          });
        }
      }

      /*
       * ------------------------------------------------------
       * DESTINATION
       * ------------------------------------------------------
       */

      let resolvedDestinationId =
        destination_id
          ? Number(destination_id)
          : null;

      let destinationName =
        typeof destination ===
        'string'
          ? destination.trim()
          : '';

      /*
       * If destination_id was supplied,
       * verify it exists.
       */

      if (resolvedDestinationId) {

        if (
          !Number.isInteger(
            resolvedDestinationId
          ) ||
          resolvedDestinationId <= 0
        ) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Destination ID must be a valid integer'
          });
        }

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
              'Selected destination does not exist'
          });
        }

        if (!destinationName) {
          destinationName =
            destinationResult.rows[0]
              .name;
        }

      } else {

        /*
         * No destination_id.
         * Resolve it using the destination text.
         */

        if (!destinationName) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Destination is required'
          });
        }

        const existingDestination =
          await query(
            `
              SELECT id, name
              FROM destinations
              WHERE LOWER(TRIM(name))
                    =
                    LOWER(TRIM($1))
              LIMIT 1
            `,
            [destinationName]
          );

        if (
          existingDestination.rows
            .length > 0
        ) {

          resolvedDestinationId =
            existingDestination
              .rows[0]
              .id;

          destinationName =
            existingDestination
              .rows[0]
              .name;

        } else {

          /*
           * Create new destination.
           *
           * Coordinates are nullable in the
           * existing destinations schema.
           */
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
            newDestination
              .rows[0]
              .id;

          destinationName =
            newDestination
              .rows[0]
              .name;
        }
      }

      /*
       * ------------------------------------------------------
       * DESCRIPTION
       * ------------------------------------------------------
       */

      const sanitizedDescription =
        typeof description ===
        'string'
          ? description
              .trim()
              .substring(0, 5000)
          : null;

      /*
       * ------------------------------------------------------
       * LOCATION
       * ------------------------------------------------------
       */

      const sanitizedLocation =
        typeof location ===
        'string' &&
        location.trim()
          ? location.trim()
          : destinationName;

      /*
       * ------------------------------------------------------
       * IMAGE
       * ------------------------------------------------------
       */

      const sanitizedImage =
        typeof image ===
          'string' &&
        image.trim()
          ? image.trim()
          : null;

      /*
       * ------------------------------------------------------
       * INCLUSIONS / EXCLUSIONS
       * ------------------------------------------------------
       */

      const sanitizedInclusions =
        normalizeArray(
          inclusions
        );

      const sanitizedExclusions =
        normalizeArray(
          exclusions
        );

      /*
       * ------------------------------------------------------
       * ITINERARY
       *
       * IMPORTANT:
       * Normal textarea text is now accepted.
       * It does NOT have to be JSON.
       * ------------------------------------------------------
       */

      const sanitizedItinerary =
        normalizeItinerary(
          itinerary
        );

      /*
       * ------------------------------------------------------
       * GROUP SIZE
       * ------------------------------------------------------
       */

      const sanitizedGroupSize =
        typeof group_size ===
        'string'
          ? group_size.trim()
          : group_size ??
            null;

      /*
       * ------------------------------------------------------
       * CREATE
       * ------------------------------------------------------
       */

      const newPackage =
        await Package.create({
          host_id:
            parsedHostId,

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
          package:
            newPackage
        }
      });

    } catch (err) {

      console.error(
        'Error in createPackage:',
        err
      );

      res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Update Package
  |--------------------------------------------------------------------------
  */

  async updatePackage(req, res) {

    try {

      const { id } =
        req.params;

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

      /*
       * Destination
       */

      let resolvedDestinationId =
        destination_id
          ? Number(destination_id)
          : null;

      let destinationName =
        typeof destination ===
        'string'
          ? destination.trim()
          : '';

      if (!resolvedDestinationId) {

        if (!destinationName) {
          return res.status(400).json({
            status: 'fail',
            message:
              'Destination is required'
          });
        }

        const existingDestination =
          await query(
            `
              SELECT id, name
              FROM destinations
              WHERE LOWER(TRIM(name))
                    =
                    LOWER(TRIM($1))
              LIMIT 1
            `,
            [destinationName]
          );

        if (
          existingDestination.rows
            .length > 0
        ) {

          resolvedDestinationId =
            existingDestination
              .rows[0]
              .id;

          destinationName =
            existingDestination
              .rows[0]
              .name;

        } else {

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
            newDestination
              .rows[0]
              .id;

          destinationName =
            newDestination
              .rows[0]
              .name;
        }

      } else {

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
              'Selected destination does not exist'
          });
        }

        destinationName =
          destinationName ||
          destinationResult
            .rows[0]
            .name;
      }

      /*
       * Price
       */

      const parsedPrice =
        Number(price);

      if (
        !Number.isFinite(
          parsedPrice
        ) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Price must be a valid non-negative number'
        });
      }

      /*
       * Duration
       */

      let parsedDuration =
        duration_days;

      if (
        duration_days !==
          undefined &&
        duration_days !==
          null &&
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
              'Duration must be a positive integer'
          });
        }
      }

      /*
       * Itinerary
       */

      const sanitizedItinerary =
        normalizeItinerary(
          itinerary
        );

      /*
       * Update
       */

      const updatedPackage =
        await Package.update(
          id,
          {
            title:
              typeof title ===
              'string'
                ? title.trim()
                : title,

            description:
              typeof description ===
              'string'
                ? description.trim()
                : description,

            price:
              parsedPrice,

            duration_days:
              parsedDuration,

            location:
              typeof location ===
              'string'
                ? location.trim()
                : location,

            image:
              typeof image ===
              'string'
                ? image.trim()
                : image,

            destination_id:
              resolvedDestinationId,

            destination:
              destinationName,

            inclusions:
              normalizeArray(
                inclusions
              ),

            exclusions:
              normalizeArray(
                exclusions
              ),

            itinerary:
              sanitizedItinerary,

            group_size:
              typeof group_size ===
              'string'
                ? group_size.trim()
                : group_size,

            availability_start,
            availability_end
          }
        );

      if (!updatedPackage) {
        return res.status(404).json({
          status: 'fail',
          message:
            'Package not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          package:
            updatedPackage
        }
      });

    } catch (err) {

      console.error(
        'Error in updatePackage:',
        err
      );

      res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Package
  |--------------------------------------------------------------------------
  */

  async deletePackage(req, res) {

    try {

      const { id } =
        req.params;

      const deleted =
        await Package.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message:
            'Package not found'
        });
      }

      res.status(204).json({
        status: 'success',
        data: null
      });

    } catch (err) {

      console.error(
        'Error in deletePackage:',
        err
      );

      res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  }
};

module.exports =
  packageController;