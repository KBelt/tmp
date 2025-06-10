const getChannel = require("./rabbitMQ");
const { metrics } = require("../services/metricsService");

// Track queue status periodically
let channel;
const updateQueueMetrics = async () => {
  try {
    if (!channel) {
      channel = await getChannel();
    }

    // Get queue information
    const queueName = process.env.ITEM_SERVICE_QUEUE;
    if (queueName) {
      const queueInfo = await channel.assertQueue(queueName, {
        durable: true,
      });
      metrics.queueSizeGauge.set({ queue: queueName }, queueInfo.messageCount);
    }
  } catch (error) {
    console.error("Failed to update queue metrics:", error.message);
  }
};

// Create the interval function that calls the update function
const startUpdateQueueMetricsInterval = () => {
  // Call immediately on startup
  updateQueueMetrics();
  // Then set interval
  return setInterval(updateQueueMetrics, 5000);
};

const consume = async (exchange, queue, routingKey, handler) => {
  try {
    channel = await getChannel();

    // Ensure the exchange exists
    await channel.assertExchange(exchange, "direct", { durable: true });

    // Create a queue for this service
    const q = await channel.assertQueue(queue, { durable: true });

    // Bind the queue to the exchange with the routing key
    await channel.bindQueue(q.queue, exchange, routingKey);

    console.log(
      `Waiting for messages in queue: ${q.queue} with routing key: ${routingKey}`
    );

    // Start consuming messages
    channel.consume(
      q.queue,
      async (msg) => {
        if (msg !== null) {
          try {
            console.log(
              `Received message with routing key: ${msg.fields.routingKey}`
            );

            await handler(msg.content.toString());

            // Acknowledge the message
            channel.ack(msg);
          } catch (error) {
            console.error(`Error processing message: ${error}`);
            // Reject the message and requeue
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error(`Failed to consume messages: ${error}`);
  }
};

module.exports = { consume, startUpdateQueueMetricsInterval };
