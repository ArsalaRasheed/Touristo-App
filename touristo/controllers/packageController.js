const Package =
  require('../models/Package');

const TourGuide =
  require('../models/TourGuide');

const {
  query
} =
  require('../config/database');

const {
  uploadPackageImage,
  deletePackageImage,
  PackageImageValidationError,
  PackageImageStorageError
} =
  require('../utils/packageStorage');

const aiService =
  require('../services/aiService');


/*
|--------------------------------------------------------------------------
| AI draft response cache
|--------------------------------------------------------------------------
| Identical requests from the same host inside the TTL are served from
| memory instead of paying for another model call (cost control).
*/
const crypto = require('crypto');

const AI_DRAFT_CACHE_TTL_MS =
  5 * 60 * 1000;

const AI_DRAFT_CACHE_MAX_ENTRIES = 50;

const aiDraftCache = new Map();


const buildDraftCacheKey = (
  userId,
  brief,
  details
) =>
  crypto
    .createHash('sha256')
    .update(
      `${userId}|${brief}|${JSON.stringify(details)}`
    )
    .digest('hex');


const readDraftCache = key => {
  const hit = aiDraftCache.get(key);

  if (!hit) {
    return null;
  }

  if (
    Date.now() - hit.createdAt >
    AI_DRAFT_CACHE_TTL_MS
  ) {
    aiDraftCache.delete(key);
    return null;
  }

  return hit;
};


const writeDraftCache = (key, draft) => {
  if (aiDraftCache.size >= AI_DRAFT_CACHE_MAX_ENTRIES) {
    const oldestKey =
      aiDraftCache.keys().next().value;
    aiDraftCache.delete(oldestKey);
  }

  aiDraftCache.set(key, {
    draft,
    createdAt: Date.now()
  });
};


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


/*
 * Discovery/SEO fields accepted by create and update.
 * Whitelisted, type-checked and length-capped so the values
 * always fit the packages table columns.
 */
function sanitizeDiscoveryFields(body = {}) {

  const cleanText = (value, maxLength) =>
    typeof value === 'string'
      ? value
          .replace(
            /[\u0000-\u001F\u007F]/g,
            ' '
          )
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, maxLength)
      : '';

  const cleanList = (
    value,
    maxLength,
    itemLength
  ) =>
    Array.isArray(value)
      ? value
          .map(item =>
            cleanText(item, itemLength)
          )
          .filter(Boolean)
          .slice(0, maxLength)
      : [];

  return {
    highlights: cleanList(
      body.highlights,
      8,
      160
    ),

    activities: cleanList(
      body.activities,
      12,
      140
    ),

    tags: cleanList(body.tags, 10, 40),

    target_traveler_type:
      cleanText(
        body.target_traveler_type,
        80
      ) || null,

    best_season:
      cleanText(body.best_season, 80) ||
      null,

    safety_notes: cleanList(
      body.safety_notes,
      8,
      200
    ),

    seo_description:
      cleanText(
        body.seo_description,
        160
      ) || null
  };
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
| AI package draft sanitisation
|--------------------------------------------------------------------------
| Raw model output is NEVER trusted. Everything that reaches the host
| passes through these helpers: types are coerced, lengths capped and
| unknown keys dropped.
|--------------------------------------------------------------------------
*/

const AI_MAX_BRIEF_LENGTH = 1200;
const AI_MAX_LIST_ITEMS = 12;
const AI_MAX_ITINERARY_DAYS = 30;


const cleanAiString = (
  value,
  maxLength
) => {
  if (
    typeof value !== 'string'
  ) {
    return '';
  }

  return value
    .replace(
      /[\u0000-\u001F\u007F]/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
};


const cleanAiList = (
  value,
  maxLength = AI_MAX_LIST_ITEMS,
  itemLength = 180
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item =>
      cleanAiString(item, itemLength)
    )
    .filter(Boolean)
    .slice(0, maxLength);
};


const cleanAiInt = (
  value,
  min,
  max,
  fallback = null
) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(
      min,
      Math.round(parsed)
    )
  );
};


const cleanAiItinerary = value => {
  const days =
    normalizeItinerary(value);

  if (!Array.isArray(days)) {
    return [];
  }

  return days
    .map((entry, index) => {
      if (
        entry &&
        typeof entry === 'object'
      ) {
        const day =
          cleanAiInt(
            entry.day,
            1,
            60,
            index + 1
          );

        return {
          day,

          title:
            cleanAiString(
              entry.title,
              120
            ) ||
            `Day ${day}`,

          description:
            cleanAiString(
              entry.description,
              800
            )
        };
      }

      return {
        day: index + 1,
        title: `Day ${index + 1}`,
        description:
          cleanAiString(
            String(entry),
            800
          )
        };
    })
    .filter(
      entry => entry.description
    )
    .slice(0, AI_MAX_ITINERARY_DAYS);
};


/*
 * Keeps the itinerary consistent with the final duration:
 * trimmed to duration_days (never padded) and day numbers
 * re-sequenced so they are unique and ordered.
 */
const reconcileDraftItinerary = draft => {
  if (
    !draft ||
    !Array.isArray(draft.itinerary) ||
    draft.itinerary.length === 0
  ) {
    return draft;
  }

  if (
    draft.duration_days &&
    draft.itinerary.length > draft.duration_days
  ) {
    draft.itinerary = draft.itinerary.slice(
      0,
      draft.duration_days
    );
  }

  draft.itinerary = draft.itinerary.map(
    (entry, index) => ({
      ...entry,
      day: index + 1,
      title:
        entry.title || `Day ${index + 1}`
    })
  );

  return draft;
};


const sanitizeAiDraft = raw => {
  if (
    !raw ||
    typeof raw !== 'object'
  ) {
    return null;
  }

  const draft = {
    title: cleanAiString(
      raw.title,
      180
    ),

    description: cleanAiString(
      raw.description,
      3000
    ),

    destination: cleanAiString(
      raw.destination,
      120
    ),

    duration_days: cleanAiInt(
      raw.duration_days,
      1,
      30,
      null
    ),

    group_size: cleanAiString(
      raw.group_size,
      50
    ),

    target_traveler_type:
      cleanAiString(
        raw.target_traveler_type,
        80
      ),

    highlights: cleanAiList(
      raw.highlights,
      8,
      160
    ),

    activities: cleanAiList(
      raw.activities,
      12,
      140
    ),

    inclusions: cleanAiList(
      raw.inclusions
    ),

    exclusions: cleanAiList(
      raw.exclusions
    ),

    itinerary: cleanAiItinerary(
      raw.itinerary
    ),

    best_season: cleanAiString(
      raw.best_season,
      80
    ),

    safety_notes: cleanAiList(
      raw.safety_notes,
      8,
      200
    ),

    seo_description: cleanAiString(
      raw.seo_description,
      160
    ),

    tags: cleanAiList(
      raw.tags,
      10,
      40
    ),

    suggested_price: cleanAiInt(
      raw.suggested_price,
      1,
      10000000,
      null
    )
  };


  /*
   * A draft is only usable if the
   * fields the package form requires
   * are actually present.
   */
  reconcileDraftItinerary(draft);

  const isComplete =
    draft.title &&
    draft.description &&
    draft.destination &&
    draft.duration_days &&
    draft.itinerary.length > 0;


  return isComplete
    ? draft
    : null;
};


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
| Guide assignment validation
|--------------------------------------------------------------------------
| Every guide id passed for a package must belong to that package's host.
| Returns the normalized id array, or null when any guide is not owned.
*/

async function resolveOwnedGuideIds(
  hostId,
  guideIds
) {

  if (
    !Array.isArray(guideIds)
  ) {
    return null;
  }

  const normalized =
    guideIds
      .map(id => Number(id))
      .filter(id =>
        Number.isInteger(id)
      );

  if (normalized.length === 0) {
    return [];
  }

  const ownedGuides =
    await TourGuide.findByHostId(hostId);

  const ownedIds =
    new Set(
      ownedGuides.map(
        guide => guide.id
      )
    );

  const unknownIds =
    normalized.filter(
      id => !ownedIds.has(id)
    );

  if (unknownIds.length > 0) {
    return null;
  }

  return normalized;
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
          'Failed to load package data'
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
          'Failed to load package data'
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | GET PACKAGE TOUR GUIDES
  |--------------------------------------------------------------------------
  | Returns the guides assigned to the package. If no guides have been
  | assigned yet, falls back to all of the host's guides so existing
  | behavior keeps working until a host assigns guides.
  */

  async getPackageGuides(
    req,
    res
  ) {

    try {

      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id)
      ) {

        return res.status(400).json({
          status: 'fail',
          message:
            'Invalid package id'
        });
      }

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

      const {
        guides,
        assignedGuideIds
      } =
        await Package.findGuidesByPackageId(
          id
        );

      if (guides.length === 0) {

        const hostGuides =
          await TourGuide.findByHostId(
            pkg.host_id
          );

        return res.status(200).json({
          status: 'success',
          data: {
            guides: hostGuides,
            assignedGuideIds: []
          }
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          guides,
          assignedGuideIds
        }
      });
    } catch (err) {

      console.error(
        'Error in getPackageGuides:',
        err
      );

      return res.status(500).json({
        status: 'error',
        message:
          'Failed to load package tour guides'
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
          'Failed to load package data'
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
          'Failed to load package data'
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
        highlights,
        activities,
        tags,
        target_traveler_type,
        best_season,
        safety_notes,
        seo_description,
        availability_start,
        availability_end,
        guide_ids
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
          ? group_size
              .trim()
              .substring(0, 50)
          : group_size ?? null;


      const discoveryFields =
        sanitizeDiscoveryFields({
          highlights,
          activities,
          tags,
          target_traveler_type,
          best_season,
          safety_notes,
          seo_description
        });


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

          ...discoveryFields,

          availability_start,
          availability_end
        });


      if (guide_ids !== undefined) {

        const guideIds =
          await resolveOwnedGuideIds(
            parsedHostId,
            guide_ids
          );

        if (guideIds === null) {

          return res.status(400).json({
            status: 'fail',
            message:
              'One or more selected tour guides do not belong to your company'
          });
        }

        await Package.setGuides(
          newPackage.id,
          guideIds
        );
      }


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


      if (
        err instanceof
        PackageImageValidationError
      ) {

        return res.status(400).json({
          status: 'fail',
          message: err.message
        });
      }


      if (
        err instanceof
        PackageImageStorageError
      ) {

        return res.status(
          err.causeStatus === 503
            ? 503
            : 502
        ).json({
          status: 'error',
          message:
            'Package image could not be uploaded. Please try again.'
        });
      }


      return res.status(500).json({
        status: 'error',
        message:
          'Failed to save package'
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
        highlights,
        activities,
        tags,
        target_traveler_type,
        best_season,
        safety_notes,
        seo_description,
        availability_start,
        availability_end,
        guide_ids
      } =
        req.body;


      /*
       * Field length caps (protects storage and AI/trip-rendering output).
       */
      const textCaps = {
        title: 200,
        description: 4000,
        location: 200,
        destination: 200,
        destination_name: 200,
        group_size: 100,
        seo_description: 400,
        best_season: 200
      };
      for (const [fieldName, maxLen] of Object.entries(textCaps)) {
        if (
          req.body[fieldName] !== undefined &&
          req.body[fieldName] !== null &&
          String(req.body[fieldName]).length > maxLen
        ) {
          return res.status(400).json({
            status: 'fail',
            message: `${fieldName} must be ${maxLen} characters or fewer`
          });
        }
      }


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


      /*
       * Title is a NOT NULL column - an update
       * without it would fail at the driver level.
       */
      const sanitizedUpdateTitle =
        typeof title === 'string'
          ? title.trim()
          : '';

      if (!sanitizedUpdateTitle) {

        return res.status(400).json({
          status: 'fail',
          message:
            'Package title is required'
        });
      }


      const discoveryFields =
        sanitizeDiscoveryFields({
          highlights,
          activities,
          tags,
          target_traveler_type,
          best_season,
          safety_notes,
          seo_description
        });


      const updatedPackage =
        await Package.update(
          id,
          {

            title:
              sanitizedUpdateTitle,

            description:
              typeof description === 'string'
                ? description.trim()
                : description ?? null,

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
                ? group_size
                    .trim()
                    .substring(0, 50)
                : group_size,

            ...discoveryFields,

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


      if (guide_ids !== undefined) {

        const guideIds =
          await resolveOwnedGuideIds(
            existingPackage.host_id,
            guide_ids
          );

        if (guideIds === null) {

          return res.status(400).json({
            status: 'fail',
            message:
              'One or more selected tour guides do not belong to your company'
          });
        }

        await Package.setGuides(
          updatedPackage.id,
          guideIds
        );
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


      if (
        err instanceof
        PackageImageValidationError
      ) {

        return res.status(400).json({
          status: 'fail',
          message: err.message
        });
      }


      if (
        err instanceof
        PackageImageStorageError
      ) {

        return res.status(
          err.causeStatus === 503
            ? 503
            : 502
        ).json({
          status: 'error',
          message:
            'Package image could not be uploaded. Please try again.'
        });
      }


      return res.status(500).json({
        status: 'error',
        message:
          'Failed to save package'
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
          'Failed to load package data'
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | AI PACKAGE DRAFT
  |--------------------------------------------------------------------------
  | Host assist only. Nothing here writes to the database: the draft is
  | returned to the host, who reviews every field before saving.
  |--------------------------------------------------------------------------
  */

  async aiGeneratePackage(
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
            'Only host accounts can use the AI package builder'
        });
      }


      const brief =
        typeof req.body?.brief ===
        'string'
          ? req.body.brief.trim()
          : '';


      if (!brief) {
        return res.status(400).json({
          status: 'fail',
          message:
            'Describe the tour you want to build'
        });
      }


      if (
        brief.length >
        AI_MAX_BRIEF_LENGTH
      ) {
        return res.status(400).json({
          status: 'fail',

          message:
            `Brief must be ${AI_MAX_BRIEF_LENGTH} characters or fewer`
        });
      }


      /*
       * Optional structured trip details.
       *
       * Everything here is host input, never AI
       * invention: the draft must match it exactly.
       */
      const cleanDetail = (value, maxLength) =>
        typeof value === 'string'
          ? value.trim().substring(0, maxLength)
          : '';


      const cleanDetailInt = (value, min, max) => {
        const parsed = parseInt(value, 10);

        return (
          Number.isFinite(parsed) &&
          parsed >= min &&
          parsed <= max
        )
          ? parsed
          : null;
      };


      const rawDetails =
        req.body?.details &&
        typeof req.body.details === 'object'
          ? req.body.details
          : {};


      const details = {
        destination:
          cleanDetail(rawDetails.destination, 80),

        duration_days:
          cleanDetailInt(rawDetails.duration_days, 1, 30),

        budget_per_person:
          cleanDetailInt(
            rawDetails.budget_per_person,
            1000,
            10000000
          ),

        travelers:
          cleanDetailInt(rawDetails.travelers, 1, 50),

        travel_style:
          cleanDetail(rawDetails.travel_style, 60),

        activities:
          cleanDetail(rawDetails.activities, 400),

        accommodation:
          cleanDetail(rawDetails.accommodation, 60),

        transport:
          cleanDetail(rawDetails.transport, 60)
      };


      const detailLines = [];

      if (details.destination) {
        detailLines.push(
          `- Destination: ${details.destination}`
        );
      }

      if (details.duration_days) {
        detailLines.push(
          `- Duration: ${details.duration_days} days`
        );
      }

      if (details.budget_per_person) {
        detailLines.push(
          `- Budget per person: PKR ${details.budget_per_person}`
        );
      }

      if (details.travelers) {
        detailLines.push(
          `- Travelers: ${details.travelers}`
        );
      }

      if (details.travel_style) {
        detailLines.push(
          `- Travel style: ${details.travel_style}`
        );
      }

      if (details.activities) {
        detailLines.push(
          `- Must include activities: ${details.activities}`
        );
      }

      if (details.accommodation) {
        detailLines.push(
          `- Accommodation: ${details.accommodation}`
        );
      }

      if (details.transport) {
        detailLines.push(
          `- Transport: ${details.transport}`
        );
      }


      const structuredBlock =
        detailLines.length
          ? `\nHOST-PROVIDED TRIP DETAILS\nThese are the host's own requirements. The draft MUST match them exactly and must not contradict them:\n${detailLines.join('\n')}\n`
          : '';


      if (
        !aiService.isAiConfigured()
      ) {
        return res.status(503).json({
          status: 'error',
          message:
            'AI service is not configured'
        });
      }


      /*
       * Identical request inside the cache TTL
       * is answered from memory (cost control).
       */
      const draftCacheKey =
        buildDraftCacheKey(
          req.user.id,
          brief,
          details
        );

      const cachedDraft =
        readDraftCache(draftCacheKey);

      if (cachedDraft) {
        return res.status(200).json({
          status: 'success',

          data: {
            draft: cachedDraft.draft,

            generatedAt:
              new Date(
                cachedDraft.createdAt
              ).toISOString(),

            published: false,
            cached: true
          }
        });
      }


      /*
       * Real Touristo context.
       *
       * Only marketplace metadata is used:
       * destination names, the host's own
       * company name and the shape of the
       * host's own packages.
       */
      let destinationNames = [];
      let companyName = null;
      let existingPackages = [];


      try {
        const destinationsResult =
          await query(
            `
              SELECT name
              FROM destinations
              ORDER BY name ASC
              LIMIT 60
            `
          );


        destinationNames =
          destinationsResult.rows
            .map(row => row.name)
            .filter(Boolean);
      } catch (contextErr) {
        console.error(
          'AI builder destination context failed:',
          contextErr.message
        );
      }


      try {
        const hostResult =
          await query(
            `
              SELECT company_name
              FROM hosts
              WHERE user_id = $1
              LIMIT 1
            `,
            [req.user.id]
          );


        companyName =
          hostResult.rows[0]
            ?.company_name || null;


        const packagesResult =
          await query(
            `
              SELECT
                p.title,
                p.destination,
                p.duration_days,
                p.group_size
              FROM packages p
              INNER JOIN hosts h
                ON h.id = p.host_id
              WHERE h.user_id = $1
              ORDER BY p.created_at DESC
              LIMIT 5
            `,
            [req.user.id]
          );


        existingPackages =
          packagesResult.rows;
      } catch (contextErr) {
        console.error(
          'AI builder host context failed:',
          contextErr.message
        );
      }


      const prompt = `
You are the package architect for Touristo, a Pakistani
tourism marketplace that connects tour companies with
travelers.

A tour company owner has described a tour they want to
publish. Produce a structured DRAFT that they will review
and edit before publishing.

HOST BRIEF:
"""
${brief}
"""
${structuredBlock}
TOURISTO CONTEXT
Company name: ${
        companyName || 'not provided'
      }

Known Touristo destinations (prefer one of these when the
brief matches):
${
        destinationNames.length
          ? destinationNames.join(', ')
          : 'none listed'
      }

Existing packages from this host (match their style, do not
copy them):
${
        existingPackages.length
          ? JSON.stringify(
              existingPackages
            )
          : 'none yet'
      }

RULES
- Output ONLY valid JSON. No markdown, no commentary.
- Never invent certifications, licenses, awards, ratings,
  reviews, availability, dates or statistics.
- Do not decide the final price. Only return
  "suggested_price" (integer PKR) when a budget is given
  in the brief or the HOST-PROVIDED TRIP DETAILS, and
  never let it exceed the budget per person; otherwise
  return null.
- When HOST-PROVIDED TRIP DETAILS are present, honour
  every field exactly: destination, duration, travelers,
  travel style, activities, accommodation and transport.
  Do not contradict them anywhere in the draft.
- Write in English.
- Everything must be realistic for travel in Pakistan.
- Safety notes must be practical and destination relevant.
- Itinerary must have one entry per day, day numbered from 1,
  and must match "duration_days" exactly.
- seo_description: one search-friendly sentence, max 160 chars.
- tags: 3-10 short lowercase search tags.

RETURN EXACTLY THIS SHAPE:
{
  "title": "string, max 120 chars",
  "description": "string, 200-900 chars, compelling but accurate",
  "destination": "string",
  "duration_days": 3,
  "group_size": "e.g. 4-8 people, max 50 chars",
  "target_traveler_type": "e.g. Families",
  "highlights": ["string"],
  "activities": ["string"],
  "inclusions": ["string"],
  "exclusions": ["string"],
  "itinerary": [
    { "day": 1, "title": "string", "description": "string" }
  ],
  "best_season": "string",
  "safety_notes": ["string"],
  "seo_description": "string, max 160 chars",
  "tags": ["string"],
  "suggested_price": null
}
`;


      let parsed = null;


      try {
        const result =
          await aiService.generateJson({
            prompt,
            temperature: 0.7,
            maxOutputTokens: 4096
          });

        parsed = result.data;
      } catch (aiErr) {
        if (
          aiErr instanceof
          aiService.AIError
        ) {
          return res.status(
            aiErr.status
          ).json({
            status: 'error',
            code: aiErr.code,
            message: aiErr.message
          });
        }

        console.error(
          'AI package generation failed:',
          aiErr
        );

        return res.status(503).json({
          status: 'error',
          code: 'unavailable',
          message:
            'AI package generation is temporarily unavailable. Please try again.'
        });
      }


      const draft =
        sanitizeAiDraft(parsed);


      if (!draft) {
        return res.status(422).json({
          status: 'fail',
          message:
            'The AI returned an incomplete package draft. Please try again.'
        });
      }


      /*
       * Host-provided structured details win over
       * whatever the model produced - the draft can
       * never contradict the host's own inputs.
       */
      if (details.destination) {
        draft.destination = details.destination;
      }

      if (details.duration_days) {
        draft.duration_days = details.duration_days;
      }

      if (details.travelers) {
        draft.group_size = `${details.travelers} people`;
      }

      if (
        details.budget_per_person &&
        draft.suggested_price &&
        draft.suggested_price >
          details.budget_per_person
      ) {
        draft.suggested_price =
          details.budget_per_person;
      }

      reconcileDraftItinerary(draft);

      writeDraftCache(
        draftCacheKey,
        draft
      );


      return res.status(200).json({
        status: 'success',

        data: {
          draft,

          generatedAt:
            new Date().toISOString(),

          published: false
        }
      });

    } catch (err) {

      console.error(
        'Error in aiGeneratePackage:',
        err
      );


      return res.status(500).json({
        status: 'error',
        message:
          'Failed to generate a package draft'
      });
    }
  }
};


module.exports =
  packageController;