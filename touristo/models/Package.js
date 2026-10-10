const { query, withTransaction } = require('../config/database');

const TourGuide = require('./TourGuide');

const { resolveSeededPackageImage } = require('../utils/packageImages');


class Package {

  constructor(data) {

    this.id =
      data.id;

    this.host_id =
      data.host_id;

    this.destination_id =
      data.destination_id;

    this.title =
      data.title;

    this.description =
      data.description;

    this.price =
      data.price;

    this.duration_days =
      data.duration_days;

    this.location =
      data.location;

    this.image =
      resolveSeededPackageImage(
        data.title,
        data.image
      );

    this.destination =
      data.destination;

    this.inclusions =
      data.inclusions;

    this.exclusions =
      data.exclusions;

    this.itinerary =
      data.itinerary;

    this.group_size =
      data.group_size;

    this.highlights =
      data.highlights;

    this.activities =
      data.activities;

    this.tags =
      data.tags;

    this.target_traveler_type =
      data.target_traveler_type;

    this.best_season =
      data.best_season;

    this.safety_notes =
      data.safety_notes;

    this.seo_description =
      data.seo_description;

    this.availability_start =
      data.availability_start;

    this.availability_end =
      data.availability_end;

    this.created_at =
      data.created_at;

    this.updated_at =
      data.updated_at;

    this.host_name =
      data.host_name;

    this.host_rating =
      data.host_rating;

    this.host_verified =
      data.host_verified;

    this.latitude =
      data.latitude;

    this.longitude =
      data.longitude;
  }


  static async findAll() {

    const result =
      await query(`
        SELECT
          p.id,
          p.host_id,
          p.destination_id,
          p.title,
          p.description,
          p.price,
          p.duration_days,
          p.location,
          p.image,
          p.destination,
          p.inclusions,
          p.exclusions,
          p.itinerary,
          p.group_size,
          p.highlights,
          p.activities,
          p.tags,
          p.target_traveler_type,
          p.best_season,
          p.safety_notes,
          p.seo_description,
          p.availability_start,
          p.availability_end,
          p.created_at,
          p.updated_at,
          d.latitude,
          d.longitude,
          h.company_name AS host_name,
          h.rating AS host_rating,
          h.verified AS host_verified
        FROM packages p
        LEFT JOIN hosts h
          ON p.host_id = h.id
        LEFT JOIN destinations d
          ON p.destination_id = d.id
        ORDER BY p.created_at DESC
      `);

    return result.rows.map(
      row =>
        new Package(row)
    );
  }


  static async findByDestinationId(
    destinationId
  ) {

    const result =
      await query(
        `
          SELECT
            p.id,
            p.host_id,
            p.destination_id,
            p.title,
            p.description,
            p.price,
            p.duration_days,
            p.location,
            p.image,
            p.destination,
            p.inclusions,
            p.exclusions,
            p.itinerary,
            p.group_size,
            p.highlights,
            p.activities,
            p.tags,
            p.target_traveler_type,
            p.best_season,
            p.safety_notes,
            p.seo_description,
            p.availability_start,
            p.availability_end,
            p.created_at,
            p.updated_at,
            d.latitude,
            d.longitude,
            h.company_name AS host_name,
            h.rating AS host_rating,
            h.verified AS host_verified
          FROM packages p
          LEFT JOIN hosts h
            ON p.host_id = h.id
          LEFT JOIN destinations d
            ON p.destination_id = d.id
          WHERE p.destination_id = $1
          ORDER BY p.created_at DESC
        `,
        [destinationId]
      );

    return result.rows.map(
      row =>
        new Package(row)
    );
  }


  static async findById(id) {

    const result =
      await query(
        `
          SELECT
            p.id,
            p.host_id,
            p.destination_id,
            p.title,
            p.description,
            p.price,
            p.duration_days,
            p.location,
            p.image,
            p.destination,
            p.inclusions,
            p.exclusions,
            p.itinerary,
            p.group_size,
            p.highlights,
            p.activities,
            p.tags,
            p.target_traveler_type,
            p.best_season,
            p.safety_notes,
            p.seo_description,
            p.availability_start,
            p.availability_end,
            p.created_at,
            p.updated_at,
            d.latitude,
            d.longitude,
            h.company_name AS host_name,
            h.rating AS host_rating,
            h.verified AS host_verified
          FROM packages p
          LEFT JOIN hosts h
            ON p.host_id = h.id
          LEFT JOIN destinations d
            ON p.destination_id = d.id
          WHERE p.id = $1
        `,
        [id]
      );

    if (
      result.rows.length === 0
    ) {
      return null;
    }

    return new Package(
      result.rows[0]
    );
  }


  static async findByHostId(
    hostId
  ) {

    const result =
      await query(
        `
          SELECT
            p.id,
            p.host_id,
            p.destination_id,
            p.title,
            p.description,
            p.price,
            p.duration_days,
            p.location,
            p.image,
            p.destination,
            p.inclusions,
            p.exclusions,
            p.itinerary,
            p.group_size,
            p.highlights,
            p.activities,
            p.tags,
            p.target_traveler_type,
            p.best_season,
            p.safety_notes,
            p.seo_description,
            p.availability_start,
            p.availability_end,
            p.created_at,
            p.updated_at,
            d.latitude,
            d.longitude,
            h.company_name AS host_name,
            h.rating AS host_rating,
            h.verified AS host_verified
          FROM packages p
          LEFT JOIN hosts h
            ON p.host_id = h.id
          LEFT JOIN destinations d
            ON p.destination_id = d.id
          WHERE p.host_id = $1
          ORDER BY p.created_at DESC
        `,
        [hostId]
      );

    return result.rows.map(
      row =>
        new Package(row)
    );
  }


  static async create(
    packageData
  ) {

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
      highlights,
      activities,
      tags,
      target_traveler_type,
      best_season,
      safety_notes,
      seo_description,
      availability_start,
      availability_end
    } = packageData;


    let itineraryJson =
      null;

    if (
      itinerary !== undefined &&
      itinerary !== null
    ) {
      itineraryJson =
        JSON.stringify(
          itinerary
        );
    }


    const result =
      await query(
        `
          INSERT INTO packages (
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
            highlights,
            activities,
            tags,
            target_traveler_type,
            best_season,
            safety_notes,
            seo_description,
            availability_start,
            availability_end
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17,
            $18,
            $19,
            $20,
            $21,
            $22
          )
          RETURNING *
        `,
        [
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
          itineraryJson,
          group_size,
          highlights,
          activities,
          tags,
          target_traveler_type,
          best_season,
          safety_notes,
          seo_description,
          availability_start,
          availability_end
        ]
      );


    return new Package(
      result.rows[0]
    );
  }


  static async update(
    id,
    packageData
  ) {

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
      highlights,
      activities,
      tags,
      target_traveler_type,
      best_season,
      safety_notes,
      seo_description,
      availability_start,
      availability_end
    } = packageData;


    let itineraryJson =
      null;

    if (
      itinerary !== undefined &&
      itinerary !== null
    ) {
      itineraryJson =
        JSON.stringify(
          itinerary
        );
    }


    const result =
      await query(
        `
          UPDATE packages
          SET
            title = $1,
            description = $2,
            price = $3,
            duration_days = $4,
            location = $5,
            image = $6,
            destination_id = $7,
            destination = $8,
            inclusions = $9,
            exclusions = $10,
            itinerary = $11,
            group_size = $12,
            highlights = $13,
            activities = $14,
            tags = $15,
            target_traveler_type = $16,
            best_season = $17,
            safety_notes = $18,
            seo_description = $19,
            availability_start = $20,
            availability_end = $21,
            updated_at = NOW()
          WHERE id = $22
          RETURNING *
        `,
        [
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
          itineraryJson,
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
          id
        ]
      );


    if (
      result.rows.length === 0
    ) {
      return null;
    }


    return new Package(
      result.rows[0]
    );
  }


  static async delete(id) {

    const result =
      await query(
        `
          DELETE FROM packages
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

    return (
      result.rows.length > 0
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Package tour-guide assignment (package_guides junction table)
  |--------------------------------------------------------------------------
  */

  /**
   * Replaces the guides assigned to a package with the given set.
   * guideIds must already be validated to belong to the package's host.
   */
  static async setGuides(packageId, guideIds) {

    const ids =
      guideIds
        .map(id => Number(id))
        .filter(id =>
          Number.isInteger(id)
        );

    await withTransaction(async client => {

      await client.query(
        `
          DELETE FROM package_guides
          WHERE package_id = $1
        `,
        [packageId]
      );

      if (ids.length === 0) {
        return;
      }

      await client.query(
        `
          INSERT INTO package_guides (package_id, tour_guide_id)
          SELECT $1, g.id
          FROM unnest($2::int[]) AS g(id)
          ON CONFLICT DO NOTHING
        `,
        [packageId, ids]
      );
    });
  }


  /**
   * Returns the guides assigned to a package together with the raw id list.
   *
   *   { guides: TourGuide[], assignedGuideIds: number[] }
   */
  static async findGuidesByPackageId(packageId) {

    const assignedResult =
      await query(
        `
          SELECT
            tg.id,
            tg.host_id,
            tg.name,
            tg.photo,
            tg.specialty,
            tg.rating,
            tg.created_at,
            tg.updated_at
          FROM package_guides pg
          JOIN tour_guides tg
            ON tg.id = pg.tour_guide_id
          WHERE pg.package_id = $1
          ORDER BY tg.rating DESC
        `,
        [packageId]
      );

    const idResult =
      await query(
        `
          SELECT tour_guide_id
          FROM package_guides
          WHERE package_id = $1
        `,
        [packageId]
      );

    return {
      guides: assignedResult.rows.map(
        row => new TourGuide(row)
      ),
      assignedGuideIds: idResult.rows.map(
        row => Number(row.tour_guide_id)
      )
    };
  }
}


module.exports =
  Package;