const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;

        // Validate required fields
        if (!sender || !receiver || !message) {
            return res.status(400).json({ message: 'Sender, receiver, and message are required' });
        }

        // Create a new message
        const newMessage = new Message({
            sender,
            receiver,
            message
        });

        // Save the message to the database
        await newMessage.save();

        // Return success response
        res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

exports.receiveMessages = async (req, res) => {
    try {
        const receiverId = req.params.receiverId; // Extract receiver ID from request parameters

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
        const { user } = req.params;
        const { sender, receiver } = req.query;

        // Validate required fields
        if (!sender || !receiver) {
            return res.status(400).json({ message: 'Sender and receiver are required' });
        }

        // Fetch chat history from the database
        const chatHistory = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ createdAt: 1 });

        // Return chat history
        res.status(200).json({ chatHistory });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
    }
};
