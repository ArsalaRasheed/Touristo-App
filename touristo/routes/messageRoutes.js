const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

// GET /api/messages/conversation/:senderId/:receiverId - Get conversation between two users
router.get('/conversation/:senderId/:receiverId', authenticateToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.findBySenderAndReceiver(senderId, receiverId);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
});

// POST /api/messages - Send a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const messageData = req.body;
    const newMessage = await Message.create(messageData);
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});

module.exports = router;