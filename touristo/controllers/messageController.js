const MarketplaceMessage = require('../models/MarketplaceMessage');


// =====================================================
// CREATE / GET CONVERSATION
// POST /api/messages/conversation
// =====================================================

exports.createConversation = async (req, res) => {
    try {
        const travelerId = req.user.id;
        const { hostId } = req.body;

        if (!hostId) {
            return res.status(400).json({
                success: false,
                message: 'hostId is required'
            });
        }

        // Only travelers can start a new host conversation
        if (req.user.role !== 'traveler') {
            return res.status(403).json({
                success: false,
                message: 'Only travelers can start a new conversation'
            });
        }

        const conversation =
            await MarketplaceMessage.getOrCreateConversation(
                travelerId,
                Number(hostId)
            );

        return res.status(200).json({
            success: true,
            data: conversation
        });

    } catch (error) {
        console.error(
            'Create conversation error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to create conversation'
        });
    }
};



// =====================================================
// GET INBOX
// GET /api/messages/inbox
// =====================================================

exports.getInbox = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let conversations;

        if (role === 'traveler') {

            conversations =
                await MarketplaceMessage.getTravelerInbox(
                    userId
                );

        } else if (role === 'host') {

            conversations =
                await MarketplaceMessage.getHostInbox(
                    userId
                );

        } else {

            return res.status(403).json({
                success: false,
                message: 'Invalid user role'
            });
        }

        return res.status(200).json({
            success: true,
            data: conversations
        });

    } catch (error) {
        console.error(
            'Get inbox error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to load inbox'
        });
    }
};



// =====================================================
// GET CONVERSATION
// GET /api/messages/conversation/:conversationId
// =====================================================

exports.getConversation = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const { conversationId } = req.params;

        const conversation =
            await MarketplaceMessage.findConversation(
                conversationId
            );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // ============================================
        // Security
        // Traveler must own conversation OR
        // logged-in user must be the host user
        // ============================================

        const travelerId =
            Number(conversation.traveler_id);

        const hostUserId = await getHostUserId(
            conversation.host_id
        );

        const isTraveler =
            travelerId === userId;

        const isHost =
            Number(hostUserId) === userId;

        if (!isTraveler && !isHost) {
            return res.status(403).json({
                success: false,
                message:
                    'You are not a member of this conversation'
            });
        }

        const messages =
            await MarketplaceMessage.getMessages(
                conversationId
            );

        return res.status(200).json({
            success: true,
            data: {
                conversation,
                messages
            }
        });

    } catch (error) {
        console.error(
            'Get conversation error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to load conversation'
        });
    }
};



// =====================================================
// SEND MESSAGE
// POST /api/messages/conversation/:conversationId/messages
// =====================================================

exports.sendMessage = async (req, res) => {
    try {
        const senderId = Number(req.user.id);
        const { conversationId } = req.params;

        const {
            messageText,
            packageId
        } = req.body;

        // ============================================
        // Validate message
        // ============================================

        if (
            !messageText ||
            typeof messageText !== 'string' ||
            !messageText.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }

        // ============================================
        // Find conversation
        // ============================================

        const conversation =
            await MarketplaceMessage.findConversation(
                conversationId
            );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // ============================================
        // Determine participants
        // ============================================

        const travelerId =
            Number(conversation.traveler_id);

        const hostUserId = await getHostUserId(
            conversation.host_id
        );

        let receiverId;

        if (senderId === travelerId) {

            // Traveler → Host
            receiverId = Number(hostUserId);

        } else if (senderId === Number(hostUserId)) {

            // Host → Traveler
            receiverId = travelerId;

        } else {

            return res.status(403).json({
                success: false,
                message:
                    'You are not a member of this conversation'
            });
        }

        // ============================================
        // Validate optional package ID
        // ============================================

        let validPackageId = null;

        if (packageId) {

            const pool =
                require('../config/database');

            const packageResult = await pool.query(
                `
                SELECT id
                FROM packages
                WHERE id = $1
                AND host_id = $2
                `,
                [
                    Number(packageId),
                    Number(conversation.host_id)
                ]
            );

            if (packageResult.rows.length > 0) {
                validPackageId =
                    Number(packageId);
            }
        }

        // ============================================
        // Send message
        // ============================================

        const message =
            await MarketplaceMessage.sendMessage({
                conversationId,
                senderId,
                receiverId,
                messageText: messageText.trim(),
                packageId: validPackageId
            });

        return res.status(201).json({
            success: true,
            data: message
        });

    } catch (error) {
        console.error(
            'Send message error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};



// =====================================================
// MARK CONVERSATION AS READ
// PATCH /api/messages/conversation/:conversationId/read
// =====================================================

exports.markAsRead = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const { conversationId } = req.params;

        const conversation =
            await MarketplaceMessage.findConversation(
                conversationId
            );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const travelerId =
            Number(conversation.traveler_id);

        const hostUserId = await getHostUserId(
            conversation.host_id
        );

        const isTraveler =
            travelerId === userId;

        const isHost =
            Number(hostUserId) === userId;

        if (!isTraveler && !isHost) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await MarketplaceMessage.markConversationRead(
            conversationId,
            userId
        );

        return res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error(
            'Mark messages as read error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
};



// =====================================================
// GET UNREAD COUNT
// GET /api/messages/unread-count
// =====================================================

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = Number(req.user.id);

        const count =
            await MarketplaceMessage.getUnreadCount(
                userId
            );

        return res.status(200).json({
            success: true,
            data: {
                unread_count: count
            }
        });

    } catch (error) {
        console.error(
            'Unread count error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
};



// =====================================================
// HELPER
// Get host's actual USER ID from hosts table
// =====================================================

async function getHostUserId(hostId) {
    const pool =
        require('../config/database');

    const result = await pool.query(
        `
        SELECT user_id
        FROM hosts
        WHERE id = $1
        `,
        [Number(hostId)]
    );

    if (result.rows.length === 0) {
        throw new Error('Host not found');
    }

    return result.rows[0].user_id;
}