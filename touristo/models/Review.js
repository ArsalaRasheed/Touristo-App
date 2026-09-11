const { query } = require('../config/database');

class Review {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.package_id = data.package_id;
    this.rating = data.rating;
    this.comment = data.comment;
    this.created_at = data.created_at;
  }

  static async findAll() {
    const result = await query(`
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      ORDER BY r.created_at DESC
    `);

    return result.rows.map(row => new Review(row));
  }

  static async findById(id) {
    const result = await query(`
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Review(result.rows[0]);
  }

  static async findByPackageId(packageId) {
    const result = await query(`
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      WHERE r.package_id = $1
      ORDER BY r.created_at DESC
    `, [packageId]);

    return result.rows.map(row => new Review(row));
  }

  static async findByUserId(userId) {
    const result = await query(`
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at,
        p.title AS package_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    return result.rows.map(row => new Review(row));
  }

  static async create(reviewData) {
    const {
      user_id,
      package_id,
      rating,
      comment
    } = reviewData;

    const result = await query(
      `
        INSERT INTO reviews (
          user_id,
          package_id,
          rating,
          comment
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          user_id,
          package_id,
          rating,
          comment,
          created_at
      `,
      [
        user_id,
        package_id,
        rating,
        comment
      ]
    );

    return new Review(result.rows[0]);
  }

  static async update(id, reviewData) {
    const {
      rating,
      comment
    } = reviewData;

    const result = await query(
      `
        UPDATE reviews
        SET
          rating = $1,
          comment = $2
        WHERE id = $3
        RETURNING
          id,
          user_id,
          package_id,
          rating,
          comment,
          created_at
      `,
      [
        rating,
        comment,
        id
      ]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new Review(result.rows[0]);
  }

  static async delete(id) {
    const result = await query(
      `
        DELETE FROM reviews
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    return result.rows.length > 0;
  }
}

module.exports = Review;