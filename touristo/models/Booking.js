const { query } = require('../config/database');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.package_id = data.package_id;
    this.booking_date = data.booking_date;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.total_price = data.total_price;
    this.status = data.status;
    this.payment_status = data.payment_status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Include package information
    this.package_title = data.package_title;
    this.package_image = data.package_image;
    this.destination = data.destination;
    // Include travelers count from booking
    this.travelers = data.travelers;
    // Include user information
    this.user_name = data.user_name;
    this.user_email = data.user_email;
    this.user_phone = data.user_phone;
  }

  static async findAll() {
    const result = await query(`
      SELECT b.id, b.user_id, b.package_id, b.booking_date, b.start_date, b.end_date, b.total_price, b.status, b.payment_status, b.created_at,
             p.title AS package_title, p.image AS package_image, p.destination, b.travelers,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.created_at DESC
    `);
    return result.rows.map(row => new Booking(row));
  }

  static async findById(id) {
    const result = await query(`
      SELECT b.id, b.user_id, b.package_id, b.booking_date, b.start_date, b.end_date, b.total_price, b.status, b.payment_status, b.created_at, b.updated_at,
             p.title AS package_title, p.image AS package_image, p.destination, b.travelers,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.id = $1
    `, [id]);
    if (result.rows.length === 0) return null;
    return new Booking(result.rows[0]);
  }

  static async findByUserId(userId) {
    const result = await query(`
      SELECT b.id, b.user_id, b.package_id, b.booking_date, b.start_date, b.end_date, b.total_price, b.status, b.payment_status, b.created_at, b.updated_at,
             p.title AS package_title, p.image AS package_image, p.destination, b.travelers,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);
    return result.rows.map(row => new Booking(row));
  }

  static async findByPackageId(packageId) {
    const result = await query(`
      SELECT b.id, b.user_id, b.package_id, b.booking_date, b.start_date, b.end_date, b.total_price, b.status, b.payment_status, b.created_at, b.updated_at,
             p.title AS package_title, p.image AS package_image, p.destination, b.travelers,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.package_id = $1
      ORDER BY b.created_at DESC
    `, [packageId]);
    return result.rows.map(row => new Booking(row));
  }

  static async findByPackageIds(packageIds) {
    if (!packageIds || packageIds.length === 0) return [];
    const placeholders = packageIds.map((_, index) => `$${index + 1}`).join(', ');
    const result = await query(`
      SELECT b.id, b.user_id, b.package_id, b.booking_date, b.start_date, b.end_date, b.total_price, b.status, b.payment_status, b.created_at, b.updated_at,
             p.title AS package_title, p.image AS package_image, p.destination, b.travelers,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.package_id IN (${placeholders})
      ORDER BY b.created_at DESC
    `, packageIds);
    return result.rows.map(row => new Booking(row));
  }

  static async create(bookingData) {
    const { user_id, package_id, booking_date, start_date, end_date, total_price, status, payment_status, travelers } = bookingData;
    const result = await query(
      `INSERT INTO bookings (
        user_id, package_id, booking_date, start_date, end_date, 
        total_price, status, payment_status, travelers
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
      `,
      [user_id, package_id, booking_date, start_date, end_date, total_price, status, payment_status, travelers]
    );
    // Return the created booking with package info
    const bookingRow = result.rows[0];
    // Get package info separately to include in the result
    const packageResult = await query(
      'SELECT title AS package_title, image AS package_image, destination FROM packages WHERE id = $1',
      [package_id]
    );
    
    // Get user info separately to include in the result
    const userResult = await query(
      'SELECT name AS user_name, email AS user_email, phone AS user_phone FROM users WHERE id = $1',
      [user_id]
    );
    
    return new Booking({
      ...bookingRow,
      ...packageResult.rows[0],
      ...userResult.rows[0]
    });
  }

  static async update(id, bookingData) {
    const { status, payment_status } = bookingData;
    const result = await query(
      `UPDATE bookings SET 
        status = $1, payment_status = $2, updated_at = NOW() 
        WHERE id = $3 RETURNING *`,
      [status, payment_status, id]
    );
    if (result.rows.length === 0) return null;
    
    // Get package info to include in the result
    const bookingRow = result.rows[0];
    const packageResult = await query(
      'SELECT title AS package_title, image AS package_image, destination FROM packages WHERE id = $1',
      [bookingRow.package_id]
    );
    
    // Get user info to include in the result
    const userResult = await query(
      'SELECT name AS user_name, email AS user_email, phone AS user_phone FROM users WHERE id = $1',
      [bookingRow.user_id]
    );
    
    return new Booking({
      ...bookingRow,
      ...packageResult.rows[0],
      ...userResult.rows[0]
    });
  }

  static async delete(id) {
    const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Booking;