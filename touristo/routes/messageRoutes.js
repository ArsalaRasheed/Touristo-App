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
  authenticateToken,
  syncRole
} = require('../middleware/auth');

// ============================================
// Inbox
// ============================================

router.get(
  '/inbox',
  authenticateToken,
  syncRole,
  getInbox
);

// ============================================
// Unread messages
// ============================================

router.get(
  '/unread-count',
  authenticateToken,
  syncRole,
  getUnreadCount
);

// ============================================
// Create / get traveler-host conversation
// ============================================

router.post(
  '/conversation',
  authenticateToken,
  syncRole,
  createConversation
);

// ============================================
// Get conversation messages
// ============================================

router.get(
  '/conversation/:conversationId',
  authenticateToken,
  syncRole,
  getConversation
);

// ============================================
// Send message
// ============================================

router.post(
  '/conversation/:conversationId/messages',
  authenticateToken,
  syncRole,
  sendMessage
);

// ============================================
// Mark conversation as read
// ============================================

router.patch(
  '/conversation/:conversationId/read',
  authenticateToken,
  syncRole,
  markAsRead
);

module.exports = router;
