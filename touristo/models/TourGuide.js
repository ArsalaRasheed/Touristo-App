const { query } = require('../config/database');

class TourGuide {
  constructor(data) {
    this.id = data.id;
    this.host_id = data.host_id;
    this.name = data.name;
    this.photo = data.photo;
    this.specialty = data.specialty;
    this.rating = data.rating;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll() {
    const result = await query(`
      SELECT tg.id, tg.host_id, tg.name, tg.photo, tg.specialty, tg.rating, tg.created_at, tg.updated_at
      FROM tour_guides tg
      ORDER BY tg.created_at DESC
    `);
    return result.rows.map(row => new TourGuide(row));
  }

  static async findById(id) {
    const result = await query(`
      SELECT tg.id, tg.host_id, tg.name, tg.photo, tg.specialty, tg.rating, tg.created_at, tg.updated_at
      FROM tour_guides tg
      WHERE tg.id = $1
    `, [id]);
    if (result.rows.length === 0) return null;
    return new TourGuide(result.rows[0]);
  }

  static async findByHostId(hostId) {
    const result = await query(`
      SELECT tg.id, tg.host_id, tg.name, tg.photo, tg.specialty, tg.rating, tg.created_at, tg.updated_at
      FROM tour_guides tg
      WHERE tg.host_id = $1
      ORDER BY tg.rating DESC
    `, [hostId]);
    return result.rows.map(row => new TourGuide(row));
  }

  static async create(tourGuideData) {
    const { host_id, name, photo, specialty, rating = 0.00 } = tourGuideData;
    const result = await query(
      'INSERT INTO tour_guides (host_id, name, photo, specialty, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [host_id, name, photo, specialty, rating]
    );
    return new TourGuide(result.rows[0]);
  }

  static async update(id, updateData) {
    const { name, photo, specialty, rating } = updateData;
    const result = await query(
      `UPDATE tour_guides SET name = $1, photo = $2, specialty = $3, rating = $4, updated_at = NOW() 
       WHERE id = $5 RETURNING *`,
      [name, photo, specialty, rating, id]
    );
    if (result.rows.length === 0) return null;
    return new TourGuide(result.rows[0]);
  }

  static async delete(id) {
    const result = await query('DELETE FROM tour_guides WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}

module.exports = TourGuide;