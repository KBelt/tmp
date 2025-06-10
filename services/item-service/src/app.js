const express = require("express");
const { startConsumer } = require("./messaging/messageHandler");
const { startUpdateQueueMetricsInterval } = require("./messaging/consumer");
const { connect } = require("./database/database");
const { createMetricsMiddleware } = require("./services/metricsService");

const app = express();
const PORT = process.env.PORT || 3000;

// Add metrics middleware
app.use(createMetricsMiddleware());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

async function start() {
  try {
    // First connect to the database
    await connect();
    console.log("Database connected successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Item service running on port ${PORT}`);
    });

    // Start the message consumer
    console.log("Starting message consumer...");
    startConsumer();
    startUpdateQueueMetricsInterval();
  } catch (error) {
    console.error("Failed to start service: ", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  const { disconnect } = require("./database/database");
  await disconnect();
  process.exit(0);
});

start().catch(console.error);
