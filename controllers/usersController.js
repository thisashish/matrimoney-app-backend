
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

        // Calculate age based on date of birth
        const age = calculateAge(dateOfBirth);
        console.log(age, 'age');

        // Update user's additional information
        user.firstName = firstName;
        user.lastName = lastName;
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        user.age = age; // Update user's age

        await user.save();

        res.status(200).json({ message: 'Additional information saved successfully' });
    } catch (error) {
        console.error('Error saving additional information:', error);
        res.status(500).json({ message: 'Failed to save additional information', error: error.message });
    }
};

// Function to calculate age based on date of birth
function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}


// exports.enterAdditionalInfo = async (req, res) => {
//     const { firstName, lastName, gender, dateOfBirth } = req.body;
//     const userId = req.userData.userId;


//     try {
//         // Find the user by ID
//         const user = await User.findOne({ userId });


//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user's additional information
//         user.firstName = firstName;
//         user.lastName = lastName;

//         user.dateOfBirth = dateOfBirth;
//         user.gender = gender;


//         await user.save();

//         res.status(200).json({ message: 'Additional information saved successfully' });
//     } catch (error) {
//         console.error('Error saving additional information:', error);
//         res.status(500).json({ message: 'Failed to save additional information', error: error.message });
//     }
// };


exports.getAdditionalInfo = async (req, res) => {
    const userId = req.userData.userId;
    console.log(userId, 'userId usersController');

    try {
        // Find the user by ID
        const user = await User.findOne({ userId });
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


// Assuming this is your profile viewing route or controller
exports.viewProfile = async (req, res) => {
    const userIdToView = req.params.userId;
    const authenticatedUserId = req.userData.userId;

    try {
        // Find the authenticated user
        const authenticatedUser = await User.findOne({ userId: authenticatedUserId });
        
        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }

        // Check if the user to view is blocked by the authenticated user
        if (authenticatedUser.blockedUsers.includes(userIdToView)) {
            // If the user is blocked, you can redirect to a 404 page or display a message
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Proceed with displaying the profile
        // You can fetch the user profile details and send them in the response
        // Example:
        const userProfile = await User.findOne({ userId: userIdToView });
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        
        res.status(200).json({ userProfile });
    } catch (error) {
        console.error('Error viewing profile:', error);
        res.status(500).json({ message: 'Failed to view profile', error: error.message });
    }
};


exports.blockUser = async (req, res) => {
    const userIdToBlock = req.params.userId;
    const authenticatedUserId = req.userData.userId;
    console.log(userIdToBlock, "userIdToBlock");
    console.log(authenticatedUserId, "authenticatedUserId");

    try {
        // Find the authenticated user
        const authenticatedUser = await User.findOne({ userId: authenticatedUserId });
        console.log(authenticatedUser, "authenticatedUser");

        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }

        // Add the userIdToBlock to the list of blocked users
        authenticatedUser.blockedUsers.push(userIdToBlock);
        await authenticatedUser.save();

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Failed to block user', error: error.message });
    }
};










