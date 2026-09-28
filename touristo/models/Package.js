const { query } = require('../config/database');


/*
|--------------------------------------------------------------------------
| Legacy image corrections
|--------------------------------------------------------------------------
|
| Only fixes the old seeded duplicate images.
|
| If a package already has a real uploaded/custom image,
| that image is always preserved.
|--------------------------------------------------------------------------
*/

const LEGACY_IMAGE_FIXES = {

  4:
    'https://images.unsplash.com/photo-1708658377336-f3bfce89ed8d?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',

  8:
    'https://images.unsplash.com/photo-1608717310359-3a1e90a53504?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',

  9:
    'https://images.unsplash.com/photo-1722599504918-a7e94343184a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600'
};


/*
|--------------------------------------------------------------------------
| Old seeded URLs that should be replaced
|--------------------------------------------------------------------------
*/

const LEGACY_DUPLICATE_IMAGES = new Set([

  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',

  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',

  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
]);


function resolvePackageImage(
  id,
  storedImage
) {

  /*
   * User-uploaded / custom images ALWAYS win.
   */
  if (
    storedImage &&
    !LEGACY_DUPLICATE_IMAGES.has(
      storedImage
    )
  ) {
    return storedImage;
  }


  /*
   * Correct the known old duplicate
   * package images.
   */
  if (
    LEGACY_IMAGE_FIXES[id]
  ) {
    return LEGACY_IMAGE_FIXES[id];
  }


  return storedImage || null;
}


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
      resolvePackageImage(
        data.id,
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
            $15
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
            availability_start = $13,
            availability_end = $14,
            updated_at = NOW()
          WHERE id = $15
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
}


module.exports =
  Package;