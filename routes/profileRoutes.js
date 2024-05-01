const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// router.post('/create-profile', profileController.createProfile);
router.put('/:_id/update-profile', profileController.updateProfile);


module.exports = router;
