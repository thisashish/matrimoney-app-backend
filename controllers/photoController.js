const User = require('../models/User');
const mongoose = require('mongoose');

exports.uploadPhotos = async (req, res) => {
    try {
        // Extract userId from userData attached by the authentication middleware
        const userId = req.userData.userId; 
        const photos = req.files;

        console.log('Uploaded files:', photos); // Log uploaded files for debugging

        // Find the user by ID
        const user = await User.findOne({userId});
        console.log(user,'user');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize photos array if it's undefined
        if (!user.photos) {
            user.photos = [];
        }

        // Save photo metadata to user document
        const uploadedPhotos = photos.map(photo => ({
            filename: photo.filename,
            originalname: photo.originalname,
            mimetype: photo.mimetype,
            size: photo.size,
            
        }));

        user.photos.push(...uploadedPhotos);
        await user.save();

        res.status(201).json({ message: 'Photos uploaded successfully' });
    } catch (error) {
        console.error('Error uploading photos:', error);
        res.status(500).json({ message: 'Failed to upload photos', error: error.message });
    }
};
