const amqp = require("amqplib");
const uri = process.env.MESSAGE_QUEUE_URL || "amqp://localhost:5672";

let channel;
let connection;

async function getChannel() {
  if (!channel) {
    for (let i = 0; i < 5; i++) {
      // Try to connect 5 times
      try {
        console.log(
          `Attempting to connect to RabbitMQ at ${uri} (attempt ${i + 1}/5)`
        );

        connection = await amqp.connect(uri, {
          frameMax: 0, // 0 means use server's value, which will be above the minimum
          heartbeat: 60, // Add heartbeat to keep connection alive
        });

        channel = await connection.createChannel();
        console.log("Successfully connected to RabbitMQ");

        // Set up error handlers for the connection
        connection.on("error", (err) => {
          console.error("RabbitMQ connection error:", err.message);
          channel = null;
        });

        connection.on("close", () => {
          console.log("RabbitMQ connection closed");
          channel = null;
        });

        break;
      } catch (error) {
        console.error(
          `Failed to connect to RabbitMQ at ${uri}, retrying in 5 seconds...`,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (!channel) {
      throw new Error("Failed to connect to RabbitMQ after 5 attempts");
    }
  }
  return channel;
}

module.exports = getChannel;
