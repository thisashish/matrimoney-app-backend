const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const authMiddleware = require('../middleware/authMiddleware');

// Get potential matches
router.get('/potential-matches/:_id',authMiddleware, matchingController.getPotentialMatches);

// Send request
router.post('/send-request', matchingController.sendRequest);

// Accept request
router.post('/accept-request', matchingController.acceptRequest);

module.exports = router;
