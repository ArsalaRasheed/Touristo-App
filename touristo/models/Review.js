const pool = require('../config/db');

class Review {
  constructor(
    id,
    user_id,
    package_id,
    rating,
    comment,
    created_at
  ) {
    this.id = id;
    this.user_id = user_id;
    this.package_id = package_id;
    this.rating = rating;
    this.comment = comment;
    this.created_at = created_at;
  }

  // Get all reviews
  static async findAll() {
    const query = `
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        p.title AS package_title
      FROM reviews r
      LEFT JOIN users u
        ON r.user_id = u.id
      LEFT JOIN packages p
        ON r.package_id = p.id
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get review by ID
  static async findById(id) {
    const query = `
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        p.title AS package_title
      FROM reviews r
      LEFT JOIN users u
        ON r.user_id = u.id
      LEFT JOIN packages p
        ON r.package_id = p.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
  }

  // Get reviews for a package
  static async findByPackageId(packageId) {
    const query = `
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name
      FROM reviews r
      LEFT JOIN users u
        ON r.user_id = u.id
      WHERE r.package_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [packageId]);

    return result.rows;
  }

  // Get reviews written by a user
  static async findByUserId(userId) {
    const query = `
      SELECT
        r.id,
        r.user_id,
        r.package_id,
        r.rating,
        r.comment,
        r.created_at,
        p.title AS package_title
      FROM reviews r
      LEFT JOIN packages p
        ON r.package_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;
  }

  // Create review
  static async create(reviewData) {
    const {
      user_id,
      package_id,
      rating,
      comment,
    } = reviewData;

    const query = `
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
    `;

    const result = await pool.query(query, [
      user_id,
      package_id,
      rating,
      comment || null,
    ]);

    return result.rows[0];
  }

  // Update review
  static async update(id, reviewData) {
    const {
      rating,
      comment,
    } = reviewData;

    const query = `
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
    `;

    const result = await pool.query(query, [
      rating,
      comment || null,
      id,
    ]);

    return result.rows[0] || null;
  }

  // Delete review
  static async delete(id) {
    const query = `
      DELETE FROM reviews
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
  }
}

module.exports = Review;