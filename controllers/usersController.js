
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const express = require('express');
const router = express.Router();



exports.enterAdditionalInfo = async (req, res) => {
    const { firstName, lastName, gender, dateOfBirth } = req.body;
    const userId = req.userData.userId;


    try {
        // Find the user by ID
        const user = await User.findOne({ userId });


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's additional information
        user.firstName = firstName;
        user.lastName = lastName;
        
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        

        await user.save();

        res.status(200).json({ message: 'Additional information saved successfully' });
    } catch (error) {
        console.error('Error saving additional information:', error);
        res.status(500).json({ message: 'Failed to save additional information', error: error.message });
    }
};


exports.getAdditionalInfo = async (req, res) => {
    const userId = req.userData.userId;
    console.log(userId, 'userId usersController');

    try {
        // Find the user by ID
        const user = await User.findOne({userId});
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
    const userId = req.userData.userId;
    console.log(userId, 'userid');

    try {
        // Find the user by ID
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find users with opposite gender
        const oppositeGenderUsers = await User.find({ gender: { $ne: user.gender } });

        // Return opposite gender users
        res.status(200).json({ oppositeGenderUsers });
    } catch (error) {
        console.error('Error retrieving opposite gender users:', error);
        res.status(500).json({ message: 'Failed to retrieve opposite gender users', error: error.message });
    }
};








