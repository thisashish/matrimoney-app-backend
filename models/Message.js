// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' }, 
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 10 }
});

module.exports = mongoose.model('Message', messageSchema);
