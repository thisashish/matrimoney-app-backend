const Message = require('../models/Message');
const User = require('../models/User');

const getPotentialMatches = async (userId) => {
    try {
        // Get the gender of the current user
        const currentUser = await User.findOne({userId});
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

        // Update receiver's receivedRequests field with the sender's ID
        await User.findByIdAndUpdate(targetId, { $push: { receivedRequests: _id } });

        // Create a custom message for the request
        const customMessage = 'I sent you a request. Would you like to connect?';

        // Save the message to the database
        const newMessage = new Message({
            sender: _id,
            receiver: targetId,
            message: customMessage
        });
        console.log(newMessage,'newMessage');
        await newMessage.save();

        res.json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send request' });
    }
};


// exports.sendRequest = async (req, res) => {
//     try {
//         const { _id, targetId } = req.body;
//         console.log(_id, "idddddddddddddddddddddddd");
//         console.log(targetId, "targetId");

//         await User.findByIdAndUpdate(_id, { $push: { sentRequests: targetId } });
//         // Update receiver's receivedRequests field with the sender's ID
//         await User.findByIdAndUpdate(targetId, { $push: { receivedRequests: _id } });
//         res.json({ message: 'Request sent successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to send request' });
//     }
// };



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

        // Remove the request from receiver's receivedRequests field
        await User.findByIdAndUpdate(_id, { $pull: { receivedRequests: targetId } });

        // Remove the declined request from sender's sentRequests
        await User.findByIdAndUpdate(targetId, { $pull: { sentRequests: _id } });

        // Check if declinedRequests field exists, if not, create it
        await User.findByIdAndUpdate(_id, { $setOnInsert: { declinedRequests: [] } }, { upsert: true });

        // Add the declined request to receiver's declinedRequests
        await User.findByIdAndUpdate(_id, { $push: { declinedRequests: targetId } });

        res.json({ message: 'Request declined successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to decline request' });
    }
};




// exports.declineRequest = async (req, res) => {
//     try {
//         console.log("Decline request controller reached");
//         const { _id, targetId } = req.body;

//         // Remove request from receiver's receivedRequests field
//         const updatedReceiver = await User.findByIdAndUpdate(_id, { $pull: { receivedRequests: targetId } });
//         console.log("Updated receiver:", updatedReceiver);

//         // Remove request from sender's sentRequests field
//         const updatedSender = await User.findByIdAndUpdate(targetId, { $pull: { sentRequests: _id } });
//         console.log("Updated sender:", updatedSender);

//         // Add target's ID to the declinedRequests field of the sender
//         const updatedSenderWithDeclined = await User.findByIdAndUpdate(_id, { $push: { declinedRequests: targetId } });
//         console.log("Updated sender with declined requests:", updatedSenderWithDeclined);

//         res.json({ message: 'Request declined successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to decline request' });
//     }
// };





// exports.declineRequest = async (req, res) => {
//     try {
//         const { _id, targetId } = req.body;

//         // Remove request from receiver's receivedRequests field
//         await User.findByIdAndUpdate(_id, { $pull: { receivedRequests: targetId } });
//         // Remove request from sender's sentRequests field
//         await User.findByIdAndUpdate(targetId, { $pull: { sentRequests: _id } });
//         res.json({ message: 'Request declined successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to decline request' });
//     }
// };

