const amqp = require('amqplib/callback_api');

// Initialize channel variable
let channel = null;
let isConnected = false;

// RabbitMQ URL and Queue Name from environment variable
// const rabbitmqUrl = process.env.RABBITMQ_URL_PROD;
// const queueName = process.env.RABBITMQ_QUEUE_NAME;
const rabbitmqUrl = "amqp://rabbitmq:Bhad@mt42@https://rabbitmq-6wqx.onrender.com:5672";

const maxRetries = 3;
let retryCount = 0;

// Function to establish RabbitMQ connection
const connectRabbitMQ = () => {
  if (!rabbitmqUrl) {
    console.error('RABBITMQ_URL_PROD is not defined');
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
          setTimeout(attemptConnection, 2000);
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
        channel.assertQueue(queueName, { durable: true }, (error2, ok) => {
          if (error2) {
            console.error('Failed to assert queue:', error2.message);
            return;
          }
          console.log('Connected to RabbitMQ and queue asserted');
          retryCount = 0; // Reset retry count on successful connection
          isConnected = true; // Indicate that connection and channel are ready
        });
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
  channel.assertQueue(queue, { durable: true }, (err, ok) => {
    if (err) {
      console.error('Failed to assert queue:', err.message);
      return;
    }
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
    console.log('Message sent to queue:', message);
  });
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
              console.log('Message received and acknowledged:', message);
              resolve([message]);
            } else {
              channel.nack(msg);
              console.log('Message not for this receiver, not acknowledged:', message);
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

// Wrapper function to send a message once the connection is established
const sendWhenConnected = (queue, message) => {
  if (isConnected) {
    sendMessageToQueue(queue, message);
  } else {
    console.log('Waiting for connection to RabbitMQ...');
    const checkConnection = setInterval(() => {
      if (isConnected) {
        clearInterval(checkConnection);
        sendMessageToQueue(queue, message);
      }
    }, 1000); // Check every 1 second
  }
};

module.exports = {
  sendMessageToQueue: sendWhenConnected,
  receiveMessagesFromQueue,
  connectRabbitMQ
};

// Connect to RabbitMQ when the module is loaded
connectRabbitMQ();
