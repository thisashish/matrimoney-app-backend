const amqp = require('amqplib');

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return { connection, channel };
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        throw error;
    }
};

module.exports = connectRabbitMQ;
