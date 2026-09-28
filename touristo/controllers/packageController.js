const Package =
  require('../models/Package');

const {
  query
} =
  require('../config/database');

const {
  uploadPackageImage,
  deletePackageImage
} =
  require('../utils/packageStorage');


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeText(value) {

  if (
    typeof value !== 'string'
  ) {
    return value;
  }

  const trimmed =
    value.trim();

  return trimmed || null;
}


function normalizeArray(value) {

  if (
    Array.isArray(value)
  ) {

    return value
      .map(item =>
        typeof item === 'string'
          ? item.trim()
          : item
      )
      .filter(
        item =>
          item !== ''
      );
  }


  if (
    typeof value === 'string'
  ) {

    return value
      .split(/\r?\n/)
      .map(item =>
        item.trim()
      )
      .filter(Boolean);
  }


  return [];
}


function normalizeItinerary(
  value
) {

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return [];
  }


  if (
    Array.isArray(value) ||
    typeof value === 'object'
  ) {
    return value;
  }


  if (
    typeof value !== 'string'
  ) {
    return [];
  }


  const text =
    value.trim();


  if (!text) {
    return [];
  }


  try {

    const parsed =
      JSON.parse(text);

    if (
      Array.isArray(parsed) ||
      typeof parsed === 'object'
    ) {
      return parsed;
    }

  } catch {
    // Continue with text parser.
  }


  const lines =
    text
      .split(/\r?\n/)
      .map(
        line =>
          line.trim()
      )
      .filter(Boolean);


  const days = [];

  let currentDay =
    null;


  for (
    const line of lines
  ) {

    const dayMatch =
      line.match(
        /^day\s*(\d+)\s*(?:[:\-–—]\s*(.*))?$/i
      );


    if (dayMatch) {

      if (currentDay) {
        days.push(
          currentDay
        );
      }


      const dayNumber =
        Number(
          dayMatch[1]
        );


      const heading =
        dayMatch[2]
          ?.trim() || '';


      currentDay = {
        day: dayNumber,
        title:
          heading ||
          `Day ${dayNumber}`,
        description:
          ''
      };

      continue;
    }


    if (!currentDay) {

      currentDay = {
        day: 1,
        title: 'Itinerary',
        description:
          line
      };

      continue;
    }


    currentDay.description =
      currentDay.description
        ? `${currentDay.description} ${line}`
        : line;
  }


  if (currentDay) {
    days.push(
      currentDay
    );
  }


  return days.length
    ? days
    : [
        {
          day: 1,
          title: 'Itinerary',
          description: text
        }
      ];
}


/*
|--------------------------------------------------------------------------
| Host ownership
|--------------------------------------------------------------------------
*/

async function getOwnedHost(
  userId,
  requestedHostId
) {

  if (
    !userId ||
    !requestedHostId
  ) {
    return null;
  }


  const result =
    await query(
      `
        SELECT
          id,
          user_id,
          company_name
        FROM hosts
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
      `,
      [
        requestedHostId,
        userId
      ]
    );


  return (
    result.rows[0] ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| Package ownership
|--------------------------------------------------------------------------
*/

async function userOwnsPackage(
  userId,
  packageId
) {

  const result =
    await query(
      `
        SELECT
          p.id,
          p.host_id,
          p.image
        FROM packages p
        INNER JOIN hosts h
          ON h.id = p.host_id
        WHERE p.id = $1
          AND h.user_id = $2
        LIMIT 1
      `,
      [
        packageId,
        userId
      ]
    );


  return (
    result.rows[0] ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| Controller
|--------------------------------------------------------------------------
*/

const packageController = {


  /*
  |--------------------------------------------------------------------------
  | GET ALL PACKAGES
  |--------------------------------------------------------------------------
  */

  async getAllPackages(
    req,
    res
  ) {

    try {

      const packages =
        await Package.findAll();


      return res.status(200).json({
        status: 'success',

        results:
          packages.length,

        data: {
          packages
        }
      });

    } catch (err) {

      console.error(
        'Error in getAllPackages:',
        err
      );


      return res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | GET PACKAGE BY ID
  |--------------------------------------------------------------------------
  */

  async getPackageById(
    req,
    res
  ) {

    try {

      const {
        id
      } =
        req.params;


      const pkg =
        await Package.findById(
          id
        );


      if (!pkg) {

        return res.status(404).json({
          status: 'fail',
          message:
            'Package not found'
        });
      }


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
          ratingsResult
            .rows[0]
            ?.avg_rating
        ) || 0;


      const totalReviews =
        parseInt(
          ratingsResult
            .rows[0]
            ?.total_reviews
        ) || 0;


      let reviewSummary =
        null;


      try {

        const {
          generateAndCacheSummary,
          getCachedSummary
        } =
          require(
            '../utils/reviewSummarizer'
          );


        reviewSummary =
          await getCachedSummary(
            id
          );


        if (!reviewSummary) {

          reviewSummary =
            await generateAndCacheSummary(
              id
            );
        }

      } catch (
        summaryErr
      ) {

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


      return res.status(200).json({
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


      return res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | GET PACKAGES BY HOST
  |--------------------------------------------------------------------------
  */

  async getPackagesByHostId(
    req,
    res
  ) {

    try {

      const {
        hostId
      } =
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
                    SELECT
                      COUNT(*) AS count
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
                      .rows[0]
                      ?.count
                  ) || 0
              };
            }
          )
        );


      return res.status(200).json({
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


      return res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | GET PACKAGES BY DESTINATION
  |--------------------------------------------------------------------------
  */

  async getPackagesByDestinationId(
    req,
    res
  ) {

    try {

      const {
        destinationId
      } =
        req.params;


      const packages =
        await Package.findByDestinationId(
          destinationId
        );


      return res.status(200).json({
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


      return res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | CREATE PACKAGE
  |--------------------------------------------------------------------------
  */

  async createPackage(
    req,
    res
  ) {

    let uploadedStoragePath =
      null;


    try {

      /*
       * Only hosts can create packages.
       */
      if (
        req.user?.role !== 'host'
      ) {

        return res.status(403).json({
          status: 'fail',
          message:
            'Only host accounts can create packages'
        });
      }


      const {
        host_id,
        title,
        description,
        price,
        duration_days,
        location,
        image,
        image_data,
        image_name,
        image_type,
        destination,
        inclusions,
        exclusions,
        itinerary,
        group_size,
        availability_start,
        availability_end
      } =
        req.body;


      /*
       * Verify that the supplied host belongs
       * to the authenticated user.
       */
      const parsedHostId =
        Number(host_id);


      const ownedHost =
        await getOwnedHost(
          req.user.id,
          parsedHostId
        );


      if (!ownedHost) {

        return res.status(403).json({
          status: 'fail',
          message:
            'You are not authorized to create a package for this host'
        });
      }


      /*
       * Title
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
      let sanitizedDuration =
        null;


      if (
        duration_days !== undefined &&
        duration_days !== null &&
        duration_days !== ''
      ) {

        sanitizedDuration =
          Number(
            duration_days
          );


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
       * Destination
       */
      let resolvedDestinationId =
        null;


      let destinationName =
        typeof destination === 'string'
          ? destination.trim()
          : '';


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
            SELECT
              id,
              name
            FROM destinations
            WHERE LOWER(TRIM(name))
                  =
                  LOWER(TRIM($1))
            LIMIT 1
          `,
          [destinationName]
        );


      if (
        existingDestination.rows.length > 0
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
              RETURNING
                id,
                name
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


      /*
       * Description
       */
      const sanitizedDescription =
        typeof description === 'string'
          ? description
              .trim()
              .substring(
                0,
                5000
              )
          : null;


      /*
       * Location
       */
      const sanitizedLocation =
        typeof location === 'string' &&
        location.trim()
          ? location.trim()
          : destinationName;


      /*
       * Image
       *
       * New upload takes priority.
       */
      let finalImage =
        typeof image === 'string' &&
        image.trim()
          ? image.trim()
          : null;


      if (image_data) {

        const uploaded =
          await uploadPackageImage({
            imageData:
              image_data,

            imageName:
              image_name,

            imageType:
              image_type
          });


        finalImage =
          uploaded.url;

        uploadedStoragePath =
          uploaded.path;
      }


      /*
       * If creating a package, require an image.
       */
      if (!finalImage) {

        return res.status(400).json({
          status: 'fail',
          message:
            'Package image is required'
        });
      }


      const sanitizedInclusions =
        normalizeArray(
          inclusions
        );


      const sanitizedExclusions =
        normalizeArray(
          exclusions
        );


      const sanitizedItinerary =
        normalizeItinerary(
          itinerary
        );


      const sanitizedGroupSize =
        typeof group_size === 'string'
          ? group_size.trim()
          : group_size ??
            null;


      /*
       * Create package.
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
            finalImage,

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


      return res.status(201).json({
        status: 'success',

        data: {
          package:
            newPackage
        }
      });

    } catch (err) {

      /*
       * If storage upload succeeded but DB save failed,
       * clean the uploaded file.
       */
      if (uploadedStoragePath) {

        await deletePackageImage(
          uploadedStoragePath
        );
      }


      console.error(
        'Error in createPackage:',
        err
      );


      return res.status(
        err.message?.includes(
          'Image'
        )
          ? 400
          : 500
      ).json({
        status: 'error',
        message:
          err.message
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | UPDATE PACKAGE
  |--------------------------------------------------------------------------
  */

  async updatePackage(
    req,
    res
  ) {

    let uploadedStoragePath =
      null;


    try {

      if (
        req.user?.role !== 'host'
      ) {

        return res.status(403).json({
          status: 'fail',
          message:
            'Only host accounts can update packages'
        });
      }


      const {
        id
      } =
        req.params;


      /*
       * Verify ownership.
       */
      const existingPackage =
        await userOwnsPackage(
          req.user.id,
          id
        );


      if (!existingPackage) {

        return res.status(403).json({
          status: 'fail',
          message:
            'You are not authorized to update this package'
        });
      }


      const {
        title,
        description,
        price,
        duration_days,
        location,
        image,
        image_data,
        image_name,
        image_type,
        destination_id,
        destination,
        inclusions,
        exclusions,
        itinerary,
        group_size,
        availability_start,
        availability_end
      } =
        req.body;


      /*
       * Destination
       */
      let resolvedDestinationId =
        destination_id
          ? Number(
              destination_id
            )
          : null;


      let destinationName =
        typeof destination === 'string'
          ? destination.trim()
          : '';


      if (
        !resolvedDestinationId
      ) {

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
              SELECT
                id,
                name
              FROM destinations
              WHERE LOWER(TRIM(name))
                    =
                    LOWER(TRIM($1))
              LIMIT 1
            `,
            [destinationName]
          );


        if (
          existingDestination.rows.length > 0
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
                RETURNING
                  id,
                  name
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
              SELECT
                id,
                name
              FROM destinations
              WHERE id = $1
              LIMIT 1
            `,
            [
              resolvedDestinationId
            ]
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
        duration_days !== undefined &&
        duration_days !== null &&
        duration_days !== ''
      ) {

        parsedDuration =
          Number(
            duration_days
          );


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
       * IMAGE
       *
       * Keep existing image if no new file
       * was selected.
       */
      let finalImage =
        existingPackage.image;


      if (
        typeof image === 'string' &&
        image.trim()
      ) {

        finalImage =
          image.trim();
      }


      if (image_data) {

        const uploaded =
          await uploadPackageImage({
            imageData:
              image_data,

            imageName:
              image_name,

            imageType:
              image_type
          });


        finalImage =
          uploaded.url;

        uploadedStoragePath =
          uploaded.path;
      }


      /*
       * Never allow an update to remove the
       * package image accidentally.
       */
      if (!finalImage) {

        return res.status(400).json({
          status: 'fail',
          message:
            'Package image is required'
        });
      }


      const sanitizedItinerary =
        normalizeItinerary(
          itinerary
        );


      const updatedPackage =
        await Package.update(
          id,
          {

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
              finalImage,

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
              typeof group_size === 'string'
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


      return res.status(200).json({
        status: 'success',

        data: {
          package:
            updatedPackage
        }
      });

    } catch (err) {

      if (uploadedStoragePath) {

        await deletePackageImage(
          uploadedStoragePath
        );
      }


      console.error(
        'Error in updatePackage:',
        err
      );


      return res.status(
        err.message?.includes(
          'Image'
        )
          ? 400
          : 500
      ).json({
        status: 'error',
        message:
          err.message
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | DELETE PACKAGE
  |--------------------------------------------------------------------------
  */

  async deletePackage(
    req,
    res
  ) {

    try {

      if (
        req.user?.role !== 'host'
      ) {

        return res.status(403).json({
          status: 'fail',
          message:
            'Only host accounts can delete packages'
        });
      }


      const {
        id
      } =
        req.params;


      const ownedPackage =
        await userOwnsPackage(
          req.user.id,
          id
        );


      if (!ownedPackage) {

        return res.status(403).json({
          status: 'fail',
          message:
            'You are not authorized to delete this package'
        });
      }


      const deleted =
        await Package.delete(
          id
        );


      if (!deleted) {

        return res.status(404).json({
          status: 'fail',
          message:
            'Package not found'
        });
      }


      return res.status(204).send();

    } catch (err) {

      console.error(
        'Error in deletePackage:',
        err
      );


      return res.status(500).json({
        status: 'error',
        message:
          err.message
      });
    }
  }
};


module.exports =
  packageController;