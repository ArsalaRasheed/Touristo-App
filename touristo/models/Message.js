const { query } = require('../config/database');

class Message {
  constructor(data) {
    this.id = data.id;
    this.sender_id = data.sender_id;
    this.receiver_id = data.receiver_id;
    this.content = data.content;
    this.created_at = data.created_at;
  }

  static async findAll() {
    const result = await query(`
      SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at
      FROM messages m
      ORDER BY m.created_at ASC
    `);
    return result.rows.map(row => new Message(row));
  }

  static async findById(id) {
    const result = await query(`
      SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at
      FROM messages m
      WHERE m.id = $1
    `, [id]);
    if (result.rows.length === 0) return null;
    return new Message(result.rows[0]);
  }

  static async findBySenderAndReceiver(senderId, receiverId) {
    const result = await query(`
      SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at
      FROM messages m
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [senderId, receiverId]);
    return result.rows.map(row => new Message(row));
  }

  static async create(messageData) {
    const { sender_id, receiver_id, content } = messageData;
    const result = await query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, content]
    );
    return new Message(result.rows[0]);
  }

  static async delete(id) {
    const result = await query('DELETE FROM messages WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Message;