const express = require("express");
const { json, urlencoded } = require("body-parser");
const routes = require("./routes/items");
const { connect } = require("./database/database");
const promBundle = require("express-prom-bundle");

// Setup metrics middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { service: "api" },
  promClient: {
    collectDefaultMetrics: {
      timeout: 5000,
    },
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(metricsMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/items", routes);

// Connect to database and start server
async function startServer() {
  try {
    await connect();

    app.listen(PORT, () => {
      console.log(`Api service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
startServer();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  const { disconnect } = require("./database/database");
  await disconnect();
  process.exit(0);
});

module.exports = app;
