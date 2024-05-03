const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateUser = require('../middleware/authMiddleware.js');
const User = require('../models/User');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateUser, authController.logout);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp',authenticateUser, authController.verifyOTP);


// router.get('/profile', authMiddleware, authController.getUserProfile);
// router.put('/profile', authMiddleware, authController.updateUserProfile);

router.get('/user/:userId',authenticateUser, async (req, res) => {
    const { userId } = req.params; 

    try {
        // Query the database to find the user by email
        const user = await User.findOne({ userId });

        // If user is not found, return a 404 Not Found response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user is found, return the user data as a response
        res.status(200).json(user);
    } catch (error) {
        // If an error occurs, return a 500 Internal Server Error response
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: 'Failed to retrieve user data', error: error.message });
    }
});





module.exports = router;
