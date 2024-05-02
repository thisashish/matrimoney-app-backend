
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

exports.enterAdditionalInfo = async (req, res) => {
    const { firstName, lastName, age, dateOfBirth, gender, bio } = req.body;
    const userId = req.userId;
    console.log(userId, 'kkkkkkkkkkkkkkkkkkkk');

    try {
        // Find the user by ID
        const user = await User.findOne(userId);
        console.log(user, 'userdata');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's additional information
        user.firstName = firstName;
        user.lastName = lastName;
        user.age = age;
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        user.bio = bio;

        await user.save();

        res.status(200).json({ message: 'Additional information saved successfully' });
    } catch (error) {
        console.error('Error saving additional information:', error);
        res.status(500).json({ message: 'Failed to save additional information', error: error.message });
    }
};


exports.getAdditionalInfo = async (req, res) => {
    const userId = req.params._id;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return all user data
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).json({ message: 'Failed to retrieve user information', error: error.message });
    }
};



exports.getOppositeGenderUsers = async (req, res) => {
    try {
        const currentUser = req.user;

        // Get the opposite gender
        const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';

        // Query the database for users of the opposite gender
        const oppositeGenderUsers = await User.find({ gender: oppositeGender });

        res.status(200).json({ oppositeGenderUsers });
    } catch (error) {
        console.error('Error fetching opposite gender users:', error);
        res.status(500).json({ message: 'Failed to fetch opposite gender users' });
    }
};

