const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Define chat routes
router.post('/send-message', chatController.sendMessage);
router.get('/receive-messages/:receiverId', chatController.receiveMessages);
router.get('/:_id/history', chatController.getChatHistory);


module.exports = router;
