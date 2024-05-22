// const amqp = require('amqplib/callback_api');

// let channel = null;

// const connectRabbitMQ = () => {
//   const rabbitmqUrl = process.env.RABBITMQ_URL;

//   if (!rabbitmqUrl) {
//     console.error('RABBITMQ_URL is not defined');
//     return;
//   }

//   amqp.connect(rabbitmqUrl, (error0, connection) => {
//     if (error0) {
//       throw error0;
//     }
//     connection.createChannel((error1, ch) => {
//       if (error1) {
//         throw error1;
//       }
//       channel = ch;
//       // Declare the queue with the correct settings
//       channel.assertQueue('messageQueue', { durable: true });
//       console.log('Connected to RabbitMQ');
//     });
//   });
// };

// const sendMessageToQueue = (queue, message) => {
//   if (channel) {
//     channel.assertQueue(queue, { durable: true });
//     channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
//       persistent: true
//     });
//     console.log('Message sent to queue:', message);
//   } else {
//     console.error('Cannot send message, channel is not initialized');
//   }
// };

// module.exports = { connectRabbitMQ, sendMessageToQueue };
