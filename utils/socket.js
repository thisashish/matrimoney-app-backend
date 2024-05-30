// // utils/socket.js
// const socketIo = require('socket.io');
// const Message = require('../models/Message');

// let io = new WebSocket.Server({ server });

// const initializeSocket = (server) => {
//     io = socketIo(server, {
//         cors: {
//             origin: '*',
//             methods: ['GET', 'POST']
//         }
//     });

//     io.on('connection', (socket) => {
//         console.log('A user connected');
//         socket.on('disconnect', () => {
//             console.log('User disconnected');
//         });

//         // Handle message status updates (delivered/seen)
//         socket.on('messageDelivered', async (messageId) => {
//             try {
//                 // Update message status in the database (delivered)
//                 await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
//             } catch (error) {
//                 console.error('Error handling message delivered status update:', error);
//             }
//         });


//         socket.on('messageSeen', async (messageId) => {
//             try {
//                 // Update message status in the database (seen)
//                 await Message.findByIdAndUpdate(messageId, { status: 'seen' });
//             } catch (error) {
//                 console.error('Error handling message seen status update:', error);
//             }
//         });
//     });
// };

// const sendNotification = (receiver, message) => {
//     if (io) {
//         io.to(receiver).emit('notification', message);
//     }
// };

// module.exports = { initializeSocket, sendNotification };
