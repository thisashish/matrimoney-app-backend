const express = require('express');
const router = express.Router();
const { updateProfileVisitors } = require('../controllers/profileController.js');
const { getProfileVisitors } = require('../controllers/profileController.js');
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/usersController.js');
const profileController = require('../controllers/profileController.js')
const User = require('../models/User');

// router.post('/create-profile', profileController.createProfile);
router.put('/:_id/update-profile', getProfileVisitors, profileController.updateProfile);

// Route to fetch profile visitors
router.get('/:userId/profile-visitors', authenticateUser, async (req, res) => {
    try {
        // Get the userId from request parameters
        const userId = req.params.userId;

        // Call the getProfileVisitors controller function to fetch profile visitors
        const profileVisitors = await userController.getProfileVisitors(userId);

        // Send the profile visitors data as a response
        res.status(200).json({ profileVisitors });
    } catch (error) {
        console.error('Error fetching profile visitors:', error);
        res.status(500).json({ message: 'Failed to fetch profile visitors', error: error.message });
    }
});



// Route to view user's profile
router.get('/:userId', authenticateUser, updateProfileVisitors, async (req, res) => {
    try {
        // Get the userId from request parameters
        const userId = req.params.userId;
        console.log("userIdxxx", userId);

        const user = await User.findOne({userId} );
        console.log("user",user);

        // Send the user data as a response
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});


module.exports = router;
