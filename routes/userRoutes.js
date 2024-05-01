const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware.js');
const userController = require('../controllers/usersController.js');

const User = require('../models/User');


router.post('/:userId/additional-info',authenticateUser, userController.enterAdditionalInfo);

router.get('/:_id/additional-info', authenticateUser, userController.getAdditionalInfo);

// router.get('/opposite-gender',authenticateUser, userController.getOppositeGenderUsers);

router.get('/opposite-gender-users',authenticateUser, async (req, res) => {
    try {
        // Get the current user's gender from the authenticated user object
        const currentUser = req.query;
        console.log('xxxxxxxxxxyyyyyyyyyyyyyyyyyyyy',currentUser);

        // Determine the opposite gender
        const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';

        // Query the database for users of the opposite gender
        const oppositeGenderUsers = await User.find({ gender: oppositeGender });

        // Return the opposite gender users
        res.status(200).json({ oppositeGenderUsers });
    } catch (error) {
        console.error('Error fetching opposite gender users:', error);
        res.status(500).json({ message: 'Failed to fetch opposite gender users' });
    }
});



module.exports = router;

