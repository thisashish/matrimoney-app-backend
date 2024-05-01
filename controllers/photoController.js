const User = require('../models/User');
const mongoose = require('mongoose');

exports.uploadPhotos = async (req, res) => {
    const userId = req.params._id;
    const photos = req.files;

    try {
        console.log('Uploaded files:', photos); // Log uploaded files for debugging

        // Check if the user ID is a valid MongoDB ObjectID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find the user by ID
        const user = await User.findById(userId);
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
            size: photo.size
        }));

        user.photos.push(...uploadedPhotos);
        await user.save();

        res.status(201).json({ message: 'Photos uploaded successfully' });
    } catch (error) {
        console.error('Error uploading photos:', error);
        res.status(500).json({ message: 'Failed to upload photos', error: error.message });
    }
};
