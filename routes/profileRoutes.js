const express = require('express');
const router = express.Router();
const { updateProfileVisitors } = require('../controllers/profileController.js');
const { getProfileVisitors } = require('../controllers/profileController.js');
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/usersController.js');
const profileController = require('../controllers/profileController.js')
const User = require('../models/User');

// router.post('/create-profile', profileController.createProfile);
router.post('/:_id/update-profile', profileController.updateProfile);

// Route to fetch profile visitors
router.get('/:userId/profile-visitors', authenticateUser,getProfileVisitors, async (req, res) => {
    try {
        // Get the userId from request parameters
        const userId = req.params.userId;

        // Call the getProfileVisitors controller function to fetch profile visitors
        const profileVisitors = await userController.find({userId});

        // Send the profile visitors data as a response
        res.status(200).json({ profileVisitors });
    } catch (error) {
        console.error('Error fetching profile visitors:', error);
        res.status(500).json({ message: 'Failed to fetch profile visitors', error: error.message });
    }
});

router.get('/profile-visitors', authenticateUser, async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find({});

        // Initialize an array to store all profile visitors
        let allProfileVisitors = [];

        // Iterate through each user and extract their profile visitors
        users.forEach(user => {
            allProfileVisitors.push(...user.profileVisitors);
        });

        // Send the profile visitors data as a response
        res.status(200).json({ profileVisitors: allProfileVisitors });
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

        const user = await User.find({userId} );
        console.log("user",user);

        
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});



module.exports = router;
