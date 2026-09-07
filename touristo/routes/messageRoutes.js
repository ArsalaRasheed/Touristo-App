const express = require('express');

const router = express.Router();

const {
    createConversation,
    getInbox,
    getConversation,
    sendMessage,
    markAsRead,
    getUnreadCount
} = require('../controllers/messageController');

const { authenticateToken } = require('../middleware/auth');


// ============================================
// GET INBOX
// ============================================

router.get(
    '/inbox',
    authenticateToken,
    getInbox
);


// ============================================
// GET UNREAD COUNT
// ============================================

router.get(
    '/unread-count',
    authenticateToken,
    getUnreadCount
);


// ============================================
// CREATE / GET CONVERSATION
// ============================================

router.post(
    '/conversation',
    authenticateToken,
    createConversation
);


// ============================================
// GET CONVERSATION MESSAGES
// ============================================

router.get(
    '/conversation/:conversationId',
    authenticateToken,
    getConversation
);


// ============================================
// SEND MESSAGE
// ============================================

router.post(
    '/conversation/:conversationId/messages',
    authenticateToken,
    sendMessage
);


// ============================================
// MARK AS READ
// ============================================

router.patch(
    '/conversation/:conversationId/read',
    authenticateToken,
    markAsRead
);


module.exports = router;