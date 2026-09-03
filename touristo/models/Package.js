const { query } = require('../config/database');

class Package {
  constructor(data) {
    this.id = data.id;
    this.host_id = data.host_id;
    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.duration_days = data.duration_days;
    this.location = data.location;
    this.image = data.image; // Add image field
    this.destination = data.destination; // Add destination field
    this.inclusions = data.inclusions;
    this.exclusions = data.exclusions;
    this.itinerary = data.itinerary; // Add itinerary field
    this.group_size = data.group_size; // Add group_size field
    this.availability_start = data.availability_start;
    this.availability_end = data.availability_end;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Add the host_name field which comes from the SQL JOIN
    this.host_name = data.host_name;
    // Also add other fields fetched from the JOIN
    this.host_rating = data.host_rating;
    this.host_verified = data.host_verified;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
  }

  static async findAll() {
    const result = await query(`
      SELECT p.id, p.host_id, p.title, p.description, p.price, p.duration_days, p.location, p.image, p.destination, p.inclusions, p.exclusions, p.itinerary, p.group_size, p.availability_start, p.availability_end, p.created_at,
             d.latitude, d.longitude, h.company_name as host_name, h.rating as host_rating, h.verified as host_verified
      FROM packages p
      LEFT JOIN hosts h ON p.host_id = h.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      ORDER BY p.created_at DESC
    `);
    return result.rows.map(row => new Package(row));
  }

  static async findByDestinationId(destinationId) {
    const result = await query(`
      SELECT p.id, p.host_id, p.title, p.description, p.price, p.duration_days, p.location, p.image, p.destination, p.inclusions, p.exclusions, p.itinerary, p.group_size, p.availability_start, p.availability_end, p.created_at, p.updated_at,
             d.latitude, d.longitude, h.company_name as host_name, h.rating as host_rating, h.verified as host_verified
      FROM packages p
      LEFT JOIN hosts h ON p.host_id = h.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      WHERE p.destination_id = $1
      ORDER BY p.created_at DESC
    `, [destinationId]);
    return result.rows.map(row => new Package(row));
  }

  static async findById(id) {
    const result = await query(`
      SELECT p.id, p.host_id, p.title, p.description, p.price, p.duration_days, p.location, p.image, p.destination, p.inclusions, p.exclusions, p.itinerary, p.group_size, p.availability_start, p.availability_end, p.created_at, p.updated_at,
             d.latitude, d.longitude, h.company_name as host_name, h.rating as host_rating, h.verified as host_verified
      FROM packages p
      LEFT JOIN hosts h ON p.host_id = h.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) return null;
    return new Package(result.rows[0]);
  }

  static async findByHostId(hostId) {
    const result = await query(`
      SELECT p.id, p.host_id, p.title, p.description, p.price, p.duration_days, p.location, p.image, p.destination, p.inclusions, p.exclusions, p.itinerary, p.group_size, p.availability_start, p.availability_end, p.created_at, p.updated_at,
             d.latitude, d.longitude, h.company_name as host_name, h.rating as host_rating, h.verified as host_verified
      FROM packages p
      LEFT JOIN hosts h ON p.host_id = h.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      WHERE p.host_id = $1
      ORDER BY p.created_at DESC
    `, [hostId]);
    return result.rows.map(row => new Package(row));
  }

  static async create(packageData) {
    const { host_id, title, description, price, duration_days, location, image, destination, inclusions, exclusions, itinerary, group_size, availability_start, availability_end } = packageData;
    const result = await query(
      `INSERT INTO packages (
        host_id, title, description, price, duration_days, location, image, destination,
        inclusions, exclusions, itinerary, group_size, availability_start, availability_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [host_id, title, description, price, duration_days, location, image, destination, inclusions, exclusions, itinerary, group_size, availability_start, availability_end]
    );
    return new Package(result.rows[0]);
  }

  static async update(id, packageData) {
    const { title, description, price, duration_days, location, image, destination, inclusions, exclusions, itinerary, group_size, availability_start, availability_end } = packageData;
    const result = await query(
      `UPDATE packages SET 
        title = $1, description = $2, price = $3, duration_days = $4, location = $5,
        image = $6, destination = $7, inclusions = $8, exclusions = $9, itinerary = $10, group_size = $11, availability_start = $12, availability_end = $13, updated_at = NOW() 
        WHERE id = $14 RETURNING *`,
      [title, description, price, duration_days, location, image, destination, inclusions, exclusions, itinerary, group_size, availability_start, availability_end, id]
    );
    if (result.rows.length === 0) return null;
    return new Package(result.rows[0]);
  }

  static async delete(id) {
    const result = await query('DELETE FROM packages WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Package;