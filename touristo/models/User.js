const { query, withTransaction } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.phone = data.phone;
    this.role = data.role;
    this.avatar_url = data.avatar_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll() {
    const result = await query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users ORDER BY created_at DESC');
    return result.rows.map(row => new User(row));
  }

  static async findById(id) {
    const result = await query('SELECT id, name, email, password_hash, phone, role, avatar_url, created_at, updated_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  static async findByEmail(email) {
    const result = await query('SELECT id, name, email, password_hash, phone, role, avatar_url, created_at, updated_at FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  static async create(userData) {
    const { name, email, password, phone, role } = userData;

    if (!phone) {
      throw new Error('Phone number is required.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, phone, role || 'traveler']
    );
    return new User(result.rows[0]);
  }

  static async update(id, userData) {
    const { name, email, phone } = userData;

    if (!phone) {
      throw new Error('Phone number is required.');
    }

    const result = await query(
      'UPDATE users SET name = $1, email = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, email, phone, id]
    );
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  static async delete(id) {
    // Account deletion must clean up every dependent row, otherwise the
    // FK constraints (reviews, bookings, packages, messages, chats) turn
    // the DELETE into a 500. Everything runs in one transaction so a
    // partial deletion can never be observed.
    return withTransaction(async (client) => {
      const userResult = await client.query('SELECT role FROM users WHERE id = $1 FOR UPDATE', [id]);
      if (userResult.rows.length === 0) return false;

      // Host-owned packages first (their reviews/bookings reference them).
      await client.query(`
        DELETE FROM reviews WHERE package_id IN (
          SELECT p.id FROM packages p JOIN hosts h ON h.id = p.host_id WHERE h.user_id = $1
        )
      `, [id]);
      await client.query(`
        DELETE FROM bookings WHERE package_id IN (
          SELECT p.id FROM packages p JOIN hosts h ON h.id = p.host_id WHERE h.user_id = $1
        )
      `, [id]);
      // bookings of the user as a traveler
      await client.query('DELETE FROM bookings WHERE user_id = $1', [id]);
      await client.query('DELETE FROM reviews WHERE user_id = $1', [id]);
      await client.query('DELETE FROM marketplace_chats WHERE traveler_id = $1', [id]);
      await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [id]);
      await client.query('DELETE FROM reports WHERE reporter_id = $1', [id]);
      // Host profile + cascading packages/tour_guides
      await client.query('DELETE FROM hosts WHERE user_id = $1', [id]);

      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    });
  }
}

module.exports = User;