const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Define chat routes
router.post('/send-message',authMiddleware, chatController.sendMessage);
router.get('/receive-messages/:receiverId',authMiddleware, chatController.receiveMessages);
router.get('/:_id/history',authMiddleware, chatController.getChatHistory);
router.delete('/delete-old-messages',authMiddleware, chatController.deleteOldMessages);
router.get('/active-chats', authMiddleware, chatController.getActiveChats);

module.exports = router;
