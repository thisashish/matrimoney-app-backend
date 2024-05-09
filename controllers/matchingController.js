const Message = require('../models/Message');
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
        const defaultMessage = "Hi, I am interested in your profile. Can we have a nice chat?"; // Default message
        // Update sender's sentRequests field
        await User.findByIdAndUpdate(_id, { $push: { sentRequests: targetId } });
        // Update receiver's receivedRequests field with the default message
        await User.findByIdAndUpdate(targetId, { $push: { receivedRequests: { userId: _id, message: defaultMessage } } });
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

        // Update the sender's acceptedRequests field
        await User.findByIdAndUpdate(targetId, { $push: { acceptedRequests: _id } });

        // Remove request from sender's sentRequests field
        await User.findByIdAndUpdate(targetId, { $pull: { sentRequests: _id } });

        // Remove the accepted request from the receiver's receivedRequests
        await User.findByIdAndUpdate(_id, { $pull: { receivedRequests: targetId } });

        // Create a default message
        const defaultMessage = 'I accepted your request';

        // Save the message to the database
        const newMessage = new Message({
            sender: _id,
            receiver: targetId,
            message: defaultMessage
        });
        await newMessage.save();

        // Redirect the user to the chat section
        res.json({ message: 'Request accepted successfully', redirectUrl: '/chat' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to accept request' });
    }
};



exports.receiveRequest = async (req, res) => {
    try {
        const userId = req.userData.userId;

        const user = await User.findOne({ userId }).populate('receivedRequests');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ receivedRequests: user.receivedRequests });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch received requests', error: error.message });
    }

};


exports.declineRequest = async (req, res) => {
    try {
        const { _id, targetId } = req.body;
        // Remove request from receiver's receivedRequests field
        await User.findByIdAndUpdate(_id, { $pull: { receivedRequests: targetId } });
        // Remove request from sender's sentRequests field
        await User.findByIdAndUpdate(targetId, { $pull: { sentRequests: _id } });
        res.json({ message: 'Request declined successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to decline request' });
    }
};

