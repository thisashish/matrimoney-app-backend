const User = require('../models/User');

exports.getAllFemaleUsers = async (req, res) => {
    try {
        // Check if the user making the request is an admin
        if (!req.admin) {
            return res.status(403).json({ success: false, message: "User is not authorized as admin." });
        }

        // Find all female users
        const femaleUsers = await User.find({ gender: 'female' });

        res.status(200).json({ femaleUsers });
    } catch (error) {
        console.error('Error fetching female users:', error);
        res.status(500).json({ message: 'Failed to fetch female users', error: error.message });
    }
};

exports.getAllMaleUsers = async (req, res) => {
    try {
        // Check if the user making the request is an admin
        if (!req.admin) {
            return res.status(403).json({ success: false, message: "I am not authorized as admin." });
        }

        // Find all male users
        const maleUsers = await User.find({ gender: 'male' });

        res.status(200).json({ maleUsers });
    } catch (error) {
        console.error('Error fetching male users:', error);
        res.status(500).json({ message: 'Failed to fetch male users', error: error.message });
    }
};
