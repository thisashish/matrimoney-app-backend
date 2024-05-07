const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateUser = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateUser, authController.logout);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authenticateUser,authController.verifyOTP);


// router.get('/profile', authMiddleware, authController.getUserProfile);
// router.put('/profile', authMiddleware, authController.updateUserProfile);

router.get('/user-initial-info', authenticateUser, async (req, res) => {
    try {
        // Extract the user ID from the token
        const userId = req.userData;
        console.log(userId, 'userId');

        // Query the database to find the user by ID
        const user = await User.findOne(userId);

        // If user is not found or token is empty, return a 404 Not Found response
        if (!user || !user.tokens.token) {
            return res.status(404).json({ message: 'User not found or token is empty' });
        }

        // If user is found and token is not empty, return the user data as a response
        res.status(200).json(user);
    } catch (error) {
        // If an error occurs, return a 500 Internal Server Error response
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: 'Failed to retrieve user data', error: error.message });
    }
});







module.exports = router;
