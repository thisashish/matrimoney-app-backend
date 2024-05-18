const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const authMiddleware = require('../middleware/authMiddleware');
const { findByIdAndUpdate, findOneAndUpdate } = require('../models/User');

// Get potential matches
router.get('/potential-matches/:_id', authMiddleware, matchingController.getPotentialMatches);

// Send request
router.post('/send-request', authMiddleware, matchingController.sendRequest);

// Receive requests
router.get('/receive-requests', authMiddleware, matchingController.receiveRequest);

// Decline request
router.post('/decline-request', authMiddleware, matchingController.declineRequest);

// Accept request
router.post('/accept-request', authMiddleware, matchingController.acceptRequest);

module.exports = router;












