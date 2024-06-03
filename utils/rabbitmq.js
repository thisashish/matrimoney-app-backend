const amqp = require('amqplib/callback_api');

// Initialize channel variable
let channel = null;

// RabbitMQ URL
const rabbitmqUrl = process.env.RABBITMQ_URL_PROD;
// || 'amqp://guest:guest@localhost:5672';


const maxRetries = 5; 
let retryCount = 0;

// Function to establish RabbitMQ connection\

const connectRabbitMQ = () => {
  if (!rabbitmqUrl) {
    console.error('RABBITMQ_URL is not defined');
    return;
  }



  const attemptConnection = () => {
    console.log(`Attempting to connect to RabbitMQ: ${rabbitmqUrl}`);
    amqp.connect(rabbitmqUrl, (error0, connection) => {
      if (error0) {
        console.error('Failed to connect to RabbitMQ:', error0.message);

        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
          setTimeout(attemptConnection, 2000); // Retry after 2 seconds
        } else {
          console.error('Max retries reached. Could not connect to RabbitMQ.');
        }
        return;
      }

      // Handle connection errors and closures
      connection.on('error', (err) => {
        console.error('Connection error:', err.message);
      });

      connection.on('close', () => {
        console.error('Connection to RabbitMQ closed. Attempting to reconnect...');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnection, 2000); // Retry after 2 seconds
        }
      });

      // Create a channel if connection is successful
      connection.createChannel((error1, ch) => {
        if (error1) {
          console.error('Failed to create channel:', error1.message);
          return;
        }

        // Set the channel variable
        channel = ch;
        // Declare the queue with the correct settings
        channel.assertQueue('messageQueue', { durable: true });
        console.log('Connected to RabbitMQ');
        retryCount = 0; // Reset retry count on successful connection
      });
    });
  };

  attemptConnection();
};



// Function to send message to RabbitMQ queue
const sendMessageToQueue = (queue, message) => {
  if (!channel) {
    console.error('Cannot send message, channel is not initialized');
    return;
  }
  // Assert the queue and send message
  channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true
  });
  console.log('Message sent to queue:', message);
};

// Function to receive messages from RabbitMQ queue
const receiveMessagesFromQueue = (queue, receiverId) => {
  return new Promise((resolve, reject) => {
    if (!channel) {
      return reject(new Error('Channel is not initialized'));
    }
    channel.assertQueue(queue, { durable: true }, (error, ok) => {
      if (error) {
        return reject(error);
      }
      channel.consume(queue, (msg) => {
        if (msg !== null) {
          try {
            const message = JSON.parse(msg.content.toString());
            if (message.receiver === receiverId) {
              channel.ack(msg);
              resolve([message]);
            } else {
              channel.nack(msg);
            }
          } catch (err) {
            console.error('Error processing message:', err.message);
            channel.nack(msg);
          }
        }
      }, {
        noAck: false,
      });
    });
  });
};

module.exports = {
  sendMessageToQueue,
  receiveMessagesFromQueue,
  connectRabbitMQ
};
