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

const {
  authenticateToken
} = require('../middleware/auth');

// ============================================
// Inbox
// ============================================

router.get(
  '/inbox',
  authenticateToken,
  getInbox
);

// ============================================
// Unread messages
// ============================================

router.get(
  '/unread-count',
  authenticateToken,
  getUnreadCount
);

// ============================================
// Create / get traveler-host conversation
// ============================================

router.post(
  '/conversation',
  authenticateToken,
  createConversation
);

// ============================================
// Get conversation messages
// ============================================

router.get(
  '/conversation/:conversationId',
  authenticateToken,
  getConversation
);

// ============================================
// Send message
// ============================================

router.post(
  '/conversation/:conversationId/messages',
  authenticateToken,
  sendMessage
);

// ============================================
// Mark conversation as read
// ============================================

router.patch(
  '/conversation/:conversationId/read',
  authenticateToken,
  markAsRead
);

module.exports = router;