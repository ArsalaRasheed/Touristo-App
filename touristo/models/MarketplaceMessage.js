const { query } = require('../config/database');

class MarketplaceMessage {
  static async getOrCreateConversation(travelerId, hostId) {
    const conversationId = `${travelerId}_${hostId}`;

    const existing = await query(
      `
      SELECT
        mc.*,
        h.company_name,
        h.verified,
        h.rating_score
      FROM marketplace_chats mc
      JOIN hosts h ON h.id = mc.host_id
      WHERE mc.conversation_id = $1
      `,
      [conversationId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await query(
      `
      INSERT INTO marketplace_chats (
        conversation_id,
        traveler_id,
        host_id
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [conversationId, travelerId, hostId]
    );

    return result.rows[0];
  }

  static async findConversation(conversationId) {
    const result = await query(
      `
      SELECT
        mc.*,

        traveler.name AS traveler_name,
        traveler.email AS traveler_email,

        host_user.name AS host_user_name,
        h.company_name,
        h.verified,
        h.rating_score

      FROM marketplace_chats mc

      JOIN users traveler
        ON traveler.id = mc.traveler_id

      JOIN hosts h
        ON h.id = mc.host_id

      JOIN users host_user
        ON host_user.id = h.user_id

      WHERE mc.conversation_id = $1
      `,
      [conversationId]
    );

    return result.rows[0] || null;
  }

  static async getTravelerInbox(travelerId) {
    const result = await query(
      `
      SELECT
        mc.conversation_id,
        mc.traveler_id,
        mc.host_id,
        mc.last_message_snippet,
        mc.updated_at,

        h.company_name,
        h.verified,
        h.rating_score,

        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = mc.conversation_id
            AND m.receiver_id = $1
            AND m.is_read = FALSE
        ) AS unread_count,

        (
          SELECT m.created_at
          FROM messages m
          WHERE m.conversation_id = mc.conversation_id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_at

      FROM marketplace_chats mc

      JOIN hosts h
        ON h.id = mc.host_id

      WHERE mc.traveler_id = $1

      ORDER BY mc.updated_at DESC
      `,
      [travelerId]
    );

    return result.rows;
  }

  static async getHostInbox(hostUserId) {
    const result = await query(
      `
      SELECT
        mc.conversation_id,
        mc.traveler_id,
        mc.host_id,
        mc.last_message_snippet,
        mc.updated_at,

        traveler.name AS traveler_name,
        traveler.email AS traveler_email,

        h.company_name,
        h.verified,

        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = mc.conversation_id
            AND m.receiver_id = $1
            AND m.is_read = FALSE
        ) AS unread_count,

        (
          SELECT m.associated_package_id
          FROM messages m
          WHERE m.conversation_id = mc.conversation_id
            AND m.associated_package_id IS NOT NULL
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS associated_package_id,

        (
          SELECT p.title
          FROM messages m
          JOIN packages p
            ON p.id = m.associated_package_id
          WHERE m.conversation_id = mc.conversation_id
            AND m.associated_package_id IS NOT NULL
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS package_title

      FROM marketplace_chats mc

      JOIN hosts h
        ON h.id = mc.host_id

      JOIN users traveler
        ON traveler.id = mc.traveler_id

      WHERE h.user_id = $1

      ORDER BY mc.updated_at DESC
      `,
      [hostUserId]
    );

    return result.rows;
  }

  static async getMessages(conversationId) {
    const result = await query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.receiver_id,

        COALESCE(m.message_text, m.content) AS message_text,

        m.associated_package_id,
        m.is_read,
        m.created_at,

        sender.name AS sender_name

      FROM messages m

      JOIN users sender
        ON sender.id = m.sender_id

      WHERE m.conversation_id = $1

      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );

    return result.rows;
  }

  static async sendMessage({
    conversationId,
    senderId,
    receiverId,
    messageText,
    packageId = null
  }) {
    const conversation = await this.findConversation(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const host = await query(
      `
      SELECT user_id
      FROM hosts
      WHERE id = $1
      `,
      [conversation.host_id]
    );

    const hostUserId = host.rows[0]?.user_id;

    const allowedParticipants = [
      Number(conversation.traveler_id),
      Number(hostUserId)
    ];

    if (!allowedParticipants.includes(Number(senderId))) {
      throw new Error('Sender is not part of this conversation');
    }

    if (!allowedParticipants.includes(Number(receiverId))) {
      throw new Error('Receiver is not part of this conversation');
    }

    if (Number(senderId) === Number(receiverId)) {
      throw new Error('Sender and receiver cannot be the same');
    }

    const result = await query(
      `
      INSERT INTO messages (
        sender_id,
        receiver_id,
        content,
        conversation_id,
        message_text,
        associated_package_id,
        is_read
      )
      VALUES ($1, $2, $3, $4, $3, $5, FALSE)
      RETURNING *
      `,
      [
        senderId,
        receiverId,
        messageText,
        conversationId,
        packageId
      ]
    );

    await query(
      `
      UPDATE marketplace_chats
      SET
        last_message_snippet = $1,
        updated_at = NOW()
      WHERE conversation_id = $2
      `,
      [messageText.substring(0, 160), conversationId]
    );

    return result.rows[0];
  }
  static async markConversationRead(conversationId, userId) {
    await query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE conversation_id = $1
        AND receiver_id = $2
        AND is_read = FALSE
      `,
      [conversationId, userId]
    );

    return true;
  }

  static async getUnreadCount(userId) {
    const result = await query(
      `
      SELECT COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = $1
        AND is_read = FALSE
        AND conversation_id IS NOT NULL
      `,
      [userId]
    );

    return Number(result.rows[0]?.unread_count || 0);
  }
}

module.exports = MarketplaceMessage;