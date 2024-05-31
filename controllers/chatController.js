const Message = require('../models/Message');
const { sendMessageToQueue } = require('../utils/rabbitmq');
const { sendNotification } = require('../utils/socket');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;

        // Validate required fields
        if (!sender || !receiver || !message) {
            return res.status(400).json({ message: 'Sender, receiver, and message are required' });
        }

        // Create a new message
        const messageData = { sender, receiver, message };

        const newMessage = new Message(messageData);
        await newMessage.save();

        // Send message to RabbitMQ queue
        // sendMessageToQueue('messageQueue', messageData);

        // Send notification to the receiver via Socket.IO
        // sendNotification(receiver, messageData);

        // Return success response
        res.status(201).json({ message: 'Message sent successfully', data: messageData });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

exports.receiveMessages = async (req, res) => {
    try {
        const receiverId = req.params.receiverId;

        // Fetch messages from the database for the receiver
        const messages = await Message.find({ receiver: receiverId });

        // Return the messages as a response
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error receiving messages:', error);
        res.status(500).json({ message: 'Failed to receive messages', error: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const receiverId = req.params._id;
        console.log(receiverId,"receiverId");
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        // Fetch messages from the past 10 days
        const recentMessages = await Message.find({
            receiver: receiverId,
            createdAt: { $gte: tenDaysAgo }
        });

        res.status(200).json(recentMessages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
    }
};


exports.deleteOldMessages = async () => {
    try {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        // Delete messages older than 10 days
        await Message.deleteMany({ createdAt: { $lt: tenDaysAgo } });
        console.log('Old messages deleted successfully');
    } catch (error) {
        console.error('Error deleting old messages:', error);
    }
};


exports.listChats = async (req, res) => {
    try {
        const userId = req.userData._id; // Assuming the user ID is available in the request object
        console.log(userId,"userId");
        // Find unique sender-receiver pairs where the user is either the sender or receiver
        const sentMessages = await Message.find({ sender: userId }).populate('receiver', 'firstName lastName email');
        console.log(sentMessages,"sentMessages");
        const receivedMessages = await Message.find({ receiver: userId }).populate('sender', 'firstName lastName email');
        console.log(receivedMessages,"receivedMessages");
        // Extract unique users from, the messages
        const sentUsers = sentMessages.map(msg => msg.receiver);
        const receivedUsers = receivedMessages.map(msg => msg.sender);
        
        // Combine and deduplicate the user lists
        const uniqueUsers = [...new Map([...sentUsers, ...receivedUsers].map(user => [user._id, user])).values()];

        res.status(200).json(uniqueUsers);
    } catch (error) {
        console.error('Error listing chat users:', error);
        res.status(500).json({ message: 'Failed to list chat users', error: error.message });
    }
};



// exports.getActiveChats = async (req, res) => {
//     try {
//         // Log all messages to verify data
//         // const allMessages = await Message.find();
//         // console.log('All Messages:', allMessages);

//         // Find all unique users who have either sent or received a chat message
//         const chatUsers = await Message.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     senders: { $addToSet: '$sender' },
//                     receivers: { $addToSet: '$receiver' }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     users: { $setUnion: ['$senders', '$receivers'] }
//                 }
//             }
//         ]);

//         // Log the result of chatUsers aggregation
//         console.log('Chat Users:', chatUsers);

//         // Extract user IDs from chat messages
//         const chatUserIds = chatUsers.length > 0 ? chatUsers[0].users : [];

//         // Log the extracted user IDs
//         console.log('Chat User IDs:', chatUserIds);

//         // Find all users who have either sent or received a chat request
//         const requestUsers = await User.aggregate([
//             {
//                 $project: {
//                     sentRequests: 1,
//                     receivedRequests: 1
//                 }
//             },
//             {
//                 $project: {
//                     users: { $setUnion: ['$sentRequests', '$receivedRequests'] }
//                 }
//             }
//         ]);

//         // Log the result of requestUsers aggregation
//         console.log('Request Users:', requestUsers);

//         // Extract user IDs from chat requests
//         const requestUserIds = requestUsers.length > 0 ? requestUsers[0].users : [];

//         // Log the extracted request user IDs
//         console.log('Request User IDs:', requestUserIds);

//         // Combine the user IDs from both sources
//         const allUserIds = [...new Set([...chatUserIds, ...requestUserIds].map(id => mongoose.Types.ObjectId(id)))];

//         // Log the combined user IDs
//         console.log('All User IDs:', allUserIds);

//         // Retrieve user details for these unique user IDs
//         const users = await User.find({ _id: { $in: allUserIds } }).select('username email');

//         // Log the found users
//         console.log('Users:', users);

//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error in getActiveChats:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };




// exports.getActiveChats = async (req, res) => {
//     try {
//         // Find all unique users who have either sent or received a chat message
//         const chatUsers = await Message.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     senders: { $addToSet: '$senderId' },
//                     receivers: { $addToSet: '$receiverId' }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     users: { $setUnion: ['$senders', '$receivers'] }
//                 }
//             }
//         ]);

//         console.log(chatUsers,"chatUsers");

//         // Extract user IDs from chat messages
//         const chatUserIds = chatUsers.length > 0 ? chatUsers[0].users : [];

//         // Find all users who have either sent or received a chat request
//         const requestUsers = await User.aggregate([
//             {
//                 $project: {
//                     sentRequests: 1,
//                     receivedRequests: 1
//                 }
//             },
//             {
//                 $project: {
//                     users: { $setUnion: ['$sentRequests', '$receivedRequests'] }
//                 }
//             }
//         ]);

//         // Extract user IDs from chat requests
//         const requestUserIds = requestUsers.length > 0 ? requestUsers[0].users : [];

//         // Combine the user IDs from both sources
//         const allUserIds = [...new Set([...chatUserIds, ...requestUserIds].map(id => mongoose.Types.ObjectId(id)))];

//         // Retrieve user details for these unique user IDs
//         const users = await User.find({ _id: { $in: allUserIds } }).select('username email');

//         res.status(200).json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// };











// exports.sendMessage = async (req, res) => {
//     try {
//         const { sender, receiver, message } = req.body;

//         // Validate required fields
//         if (!sender || !receiver || !message) {
//             return res.status(400).json({ message: 'Sender, receiver, and message are required' });
//         }

//         // Create a new message
//         const newMessage = new Message({
//             sender,
//             receiver,
//             message
//         });

//         // Save the message to the database
//         await newMessage.save();

//         // Return success response
//         res.status(201).json({ message: 'Message sent successfully', data: newMessage });
//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).json({ message: 'Failed to send message', error: error.message });
//     }
// };

// exports.receiveMessages = async (req, res) => {
//     try {
//         const receiverId = req.params.receiverId; // Extract receiver ID from request parameters

//         // Fetch messages from the database for the receiver
//         const messages = await Message.find({ receiver: receiverId });

//         // Return the messages as a response
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error('Error receiving messages:', error);
//         res.status(500).json({ message: 'Failed to receive messages', error: error.message });
//     }
// };

// exports.getChatHistory = async (req, res) => {
//     try {
//         const { user } = req.params;
//         const { sender, receiver } = req.query;

//         // Validate required fields
//         if (!sender || !receiver) {
//             return res.status(400).json({ message: 'Sender and receiver are required' });
//         }

//         // Fetch chat history from the database
//         const chatHistory = await Message.find({
//             $or: [
//                 { sender, receiver },
//                 { sender: receiver, receiver: sender }
//             ]
//         }).sort({ createdAt: 1 });

//         // Return chat history
//         res.status(200).json({ chatHistory });
//     } catch (error) {
//         console.error('Error fetching chat history:', error);
//         res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
//     }
// };
