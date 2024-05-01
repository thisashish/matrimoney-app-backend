const User = require('../models/User');



exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params._id;
        const { bio,maritalStatus, religion, motherTongue, community, settleDown, homeTown, highestQualification, college, jobTitle, companyName, salary } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile fields
        user.bio = bio;
        user.maritalStatus = maritalStatus;
        user.religion = religion;
        user.motherTongue = motherTongue;
        user.community = community;
        user.settleDown = settleDown;
        user.homeTown = homeTown;
        user.highestQualification = highestQualification;
        user.college = college;
        user.jobTitle = jobTitle;
        user.companyName = companyName;
        user.salary = salary;
        
        // Save updated user profile
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};
