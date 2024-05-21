const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const connectRabbitMQ = require('../rabbitmq')

const getPotentialMatchesByUserId = async (userId) => {
    try {
        const currentUser = await User.findOne({ userId });

        if (!currentUser) {
            throw new Error('User not found');
        }

        const oppositeGender = currentUser.gender === 'Male' ? 'Female' : 'Male';

        const potentialMatches = await User.find({
            userId: { $ne: userId },
            gender: oppositeGender,
            'preferences.gender': currentUser.gender,
            age: {
                $gte: currentUser.preferences.ageRange.min,
                $lte: currentUser.preferences.ageRange.max
            }
        });

        return potentialMatches;
    } catch (error) {
        console.error('Error finding potential matches:', error);
        throw error;
    }
};

exports.getPotentialMatches = async (req, res) => {
    try {
        const userId = req.params.userId;
        const potentialMatches = await getPotentialMatchesByUserId(userId);
        res.json(potentialMatches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch potential matches' });
    }
};



exports.sendRequest = async (req, res) => {
    try {
        const { _id, targetId } = req.body;

        // Check if the user has exceeded the daily request limit
        const user = await User.findById(_id);
        if (user.dailyRequestCount >= 5 && !user.isPremium) {
            return res.status(403).json({ message: 'You have reached your daily request limit. Please purchase a membership to send more requests.' });
        }

        // Update sender's sentRequests field
        await User.findByIdAndUpdate(_id, { $push: { sentRequests: targetId }, $inc: { dailyRequestCount: 1 } });

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
        await newMessage.save();

        // Create a notification for the receiver
        const newNotification = new Notification({
            userId: targetId,
            message: `User ${_id} sent you a request.`
        });
        await newNotification.save();

        // Add the notification to the receiver's notifications
        await User.findByIdAndUpdate(targetId, { $push: { notifications: newNotification._id } });

        // Send a message to RabbitMQ
        const { channel } = await connectRabbitMQ();
        const queue = 'user_requests';
        const msg = JSON.stringify({
            sender: _id,
            receiver: targetId,
            message: customMessage
        });

        await channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(msg));
        console.log('Sent message to RabbitMQ:', msg);

        res.json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send request' });
    }
};


exports.getSentRequests = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the current user and populate sentRequests
        const currentUser = await User.findOne({ userId }).populate('sentRequests');
        
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the list of users to whom the current user has sent requests
        const sentRequests = currentUser.sentRequests;
       

        res.json(sentRequests);
    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({ message: 'Failed to fetch sent requests' });
    }
};



exports.receiveRequest = async (req, res) => {
    try {
        const userId = req.userData.userId;

        const user = await User.findOne({ userId }).populate('receivedRequests');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a notification for the user
        const newNotification = new Notification({
            userId: user._id,
            message: `You have received new requests.`
        });
        await newNotification.save();

        // Add the notification to the user's notifications
        await User.findByIdAndUpdate(user._id, { $push: { notifications: newNotification._id } });

        res.json({ receivedRequests: user.receivedRequests });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch received requests', error: error.message });
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


exports.getAcceptedRequests = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the current user
        const currentUser = await User.findOne({ userId }).populate('acceptedRequests');
        console.log("currentUser", currentUser);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the list of users who accepted the current user's requests
        const acceptedRequests = currentUser.acceptedRequests;

        res.json(acceptedRequests);
    } catch (error) {
        console.error('Error fetching accepted requests:', error);
        res.status(500).json({ message: 'Failed to fetch accepted requests' });
    }
};

