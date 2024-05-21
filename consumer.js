// consumer.js
const amqp = require('amqplib');

const consumeMessages = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'user_requests';

        await channel.assertQueue(queue, { durable: false });
        console.log(`Waiting for messages in queue: ${queue}`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                console.log('Received message:', content);
                // Process the message as needed
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Failed to consume messages from RabbitMQ', error);
    }
};

consumeMessages();
