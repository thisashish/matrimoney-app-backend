const User = require('../models/User');

const getPotentialMatches = async (userId) => {
    try {
        // Get the gender of the current user
        const currentUser = await User.findById(userId);
        const currentUserGender = currentUser.gender;

        // Find potential matches with opposite gender preference
        const potentialMatches = await User.find({
            _id: { $ne: userId }, // Exclude the current user from potential matches
            gender: currentUserGender === 'male' ? 'female' : 'male'
        });

        return potentialMatches;
    } catch (error) {
        console.error('Error finding potential matches:', error);
        throw error;
    }
};

exports.getPotentialMatches = async (req, res) => {
    try {
        const userId = req.params._id;
        const potentialMatches = await getPotentialMatches(userId);
        res.json(potentialMatches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch potential matches' });
    }
};
exports.sendRequest = async (req, res) => {
    try {
        const { _id, targetId } = req.body;
        // Update sender's sentRequests field
        await User.findByIdAndUpdate(_id, { $push: { sentRequests: targetId } });
        // Update receiver's receivedRequests field
        await User.findByIdAndUpdate(targetId, { $push: { receivedRequests: _id } });
        res.json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send request' });
    }
    
};

exports.acceptRequest = async (req, res) => {
    try {
        const { _id, targetId } = req.body;
        // Update receiver's acceptedRequests field
        await User.findByIdAndUpdate(_id, { $push: { acceptedRequests: targetId } });
        // Remove request from sender's sentRequests field
        await User.findByIdAndUpdate(targetId, { $pull: { sentRequests: _id } });
        res.json({ message: 'Request accepted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to accept request' });
    }
};

