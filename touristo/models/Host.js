const { query } = require('../config/database');

class Host {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.company_name = data.company_name;
    this.description = data.description;
    this.location = data.location;
    this.license_number = data.license_number;
    this.cnic_or_business_registration = data.cnic_or_business_registration; // New field
    this.company_address = data.company_address; // New field
    this.verification_status = data.verification_status; // New field
    this.verified = data.verified;
    this.rating_score = data.rating_score;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll() {
    const result = await query(`
      SELECT h.id, h.user_id, h.company_name, h.description, h.location, h.license_number, h.cnic_or_business_registration, h.company_address, h.verification_status, h.verified, h.rating_score, h.created_at
      FROM hosts h
      ORDER BY h.created_at DESC
    `);
    return result.rows.map(row => new Host(row));
  }

  static async findById(id) {
    const result = await query(`
      SELECT h.id, h.user_id, h.company_name, h.description, h.location, h.license_number, h.cnic_or_business_registration, h.company_address, h.verification_status, h.verified, h.rating_score, h.created_at, h.updated_at
      FROM hosts h
      WHERE h.id = $1
    `, [id]);
    if (result.rows.length === 0) return null;
    return new Host(result.rows[0]);
  }

  static async findByUserId(userId) {
    const result = await query(`
      SELECT h.id, h.user_id, h.company_name, h.description, h.location, h.license_number, h.cnic_or_business_registration, h.company_address, h.verification_status, h.verified, h.rating_score, h.created_at, h.updated_at
      FROM hosts h
      WHERE h.user_id = $1
    `, [userId]);
    if (result.rows.length === 0) return null;
    return new Host(result.rows[0]);
  }

  static async create(hostData) {
    const { user_id, company_name, description, location, license_number, cnic_or_business_registration, company_address } = hostData;
    const result = await query(
      'INSERT INTO hosts (user_id, company_name, description, location, license_number, cnic_or_business_registration, company_address, verification_status, verified, rating_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, 0.00) RETURNING *',
      [user_id, company_name, description, location, license_number, cnic_or_business_registration, company_address, 'pending']
    );
    return new Host(result.rows[0]);
  }

  static async update(id, hostData) {
    const { company_name, description, location, license_number, cnic_or_business_registration, company_address, verification_status, verified } = hostData;
    const result = await query(
      'UPDATE hosts SET company_name = $1, description = $2, location = $3, license_number = $4, cnic_or_business_registration = $5, company_address = $6, verification_status = $7, verified = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
      [company_name, description, location, license_number, cnic_or_business_registration, company_address, verification_status, verified, id]
    );
    if (result.rows.length === 0) return null;
    return new Host(result.rows[0]);
  }

  static async delete(id) {
    const result = await query('DELETE FROM hosts WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  static async getTourGuidesByHostId(hostId) {
    const TourGuide = require('./TourGuide');
    const result = await query(`
      SELECT tg.id, tg.host_id, tg.name, tg.photo, tg.specialty, tg.rating, tg.created_at, tg.updated_at
      FROM tour_guides tg
      WHERE tg.host_id = $1
      ORDER BY tg.rating DESC
    `, [hostId]);
    return result.rows.map(row => new TourGuide(row));
  }
}

module.exports = Host;