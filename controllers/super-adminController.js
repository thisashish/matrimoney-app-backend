// controllers/adminsController.js

const User = require('../models/User');

// exports.getAllFemaleUsers = async (req, res) => {
//     try {
//         // Check if the user making the request is an admin
//         if (!req.admin) {
//             return res.status(403).json({ success: false, message: "User is not authorized as admin." });
//         }

//         // Find all female users
//         const femaleUsers = await User.find({ gender: 'female' });

//         res.status(200).json({ femaleUsers });
//     } catch (error) {
//         console.error('Error fetching female users:', error);
//         res.status(500).json({ message: 'Failed to fetch female users', error: error.message });
//     }
// };

// controllers/adminController.js


exports.verifyFirstPhoto = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has any photos
        if (!user.photos || user.photos.length === 0) {
            return res.status(404).json({ message: 'No photos found for the user' });
        }

        // Get the first photo in the user's photos array
        const firstPhoto = user.photos[0];

        // Mark the first photo as verified
        firstPhoto.verified = true;

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'First photo verified successfully' });
    } catch (error) {
        console.error('Error verifying photo:', error);
        res.status(500).json({ message: 'Failed to verify photo', error: error.message });
    }
};



exports.getUsersByGender = async (req, res) => {
    try {
        const { gender } = req.query;

        // Query the database to find users based on gender
        const users = await User.find({ gender });
        console.log(users, 'users data');

        // Return the users as a response
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users by gender:', error);
        res.status(500).json({ message: 'Failed to fetch users by gender', error: error.message });
    }
};


exports.getAllMaleUsers = async (req, res) => {
    try {
        // Check if the user making the request is an admin
        if (!req.admin) {
            return res.status(403).json({ success: false, message: "User is not authorized as admin." });
        }

        // Find all male users
        const maleUsers = await User.find({ gender: 'male' });

        res.status(200).json({ maleUsers });
    } catch (error) {
        console.error('Error fetching male users:', error);
        res.status(500).json({ message: 'Failed to fetch male users', error: error.message });
    }
};

// Controller method to activate a user
exports.activateUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID and update their status to active
        await User.findOneAndUpdate({ userId: userId }, { status: 'active' });
        res.status(200).json({ message: 'User activated successfully' });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ message: 'Failed to activate user', error: error.message });
    }
};


// Controller method to edit user profile
exports.editUserProfile = async (req, res) => {
    const userId = req.params.userId;
    const newData = req.body; // Assuming you're sending the updated profile data in the request body
    try {
        // Find the user by ID and update their profile data
        await User.findOneAndUpdate({ userId: userId }, newData); // Pass query criteria as an object
        res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error editing user profile:', error);
        res.status(500).json({ message: 'Failed to edit user profile', error: error.message });
    }
};


// Controller method to block a user
exports.blockUser = async (req, res) => {
    const userId = req.params.userId;
    console.log(userId, "userId");
    try {
        // Find the user by ID and update their status to blocked
        await User.findOneAndUpdate({ userId: userId }, { status: 'blocked' });

        // Remove all tokens to prevent user from staying logged in
        await User.findOneAndUpdate({ userId: userId }, { $set: { tokens: [] } });

        // Clear any pending requests (optional, depending on your requirements)
        await User.findOneAndUpdate(
            { userId: userId },
            { $set: { sentRequests: [], receivedRequests: [], acceptedRequests: [], declinedRequests: [] } }
        );

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Failed to block user', error: error.message });
    }
};