const pool = require('../config/db');

class Message {

    // Create a new marketplace message
    static async create({
        conversationId,
        senderId,
        receiverId,
        messageText,
        packageId = null
    }) {

        const result = await pool.query(
            `
            INSERT INTO messages
                (
                    conversation_id,
                    sender_id,
                    receiver_id,
                    content,
                    message_text,
                    associated_package_id,
                    is_read
                )
            VALUES
                ($1, $2, $3, $4, $4, $5, FALSE)
            RETURNING *
            `,
            [
                conversationId,
                senderId,
                receiverId,
                messageText,
                packageId
            ]
        );

        return result.rows[0];
    }


    // Get all messages in conversation
    static async findByConversationId(conversationId) {

        const result = await pool.query(
            `
            SELECT
                m.*,

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


    // Mark messages as read
    static async markAsRead(conversationId, receiverId) {

        const result = await pool.query(
            `
            UPDATE messages
            SET is_read = TRUE

            WHERE conversation_id = $1
            AND receiver_id = $2
            AND is_read = FALSE

            RETURNING id
            `,
            [conversationId, receiverId]
        );

        return result.rows;
    }


    // Count unread messages
    static async unreadCount(userId) {

        const result = await pool.query(
            `
            SELECT COUNT(*) AS unread_count

            FROM messages

            WHERE receiver_id = $1
            AND is_read = FALSE
            `,
            [userId]
        );

        return Number(result.rows[0].unread_count);
    }
}

module.exports = Message;