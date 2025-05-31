const promClient = require("prom-client");

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Custom metrics for message handling
const messagesProcessedTotal = new promClient.Counter({
  name: "messages_processed_total",
  help: "Total number of messages processed",
  labelNames: ["status"],
  registers: [register],
});

const messageProcessDurationSeconds = new promClient.Histogram({
  name: "message_process_duration_seconds",
  help: "Duration of message processing in seconds",
  labelNames: ["status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Custom metrics for database operations
const dbOperationsTotal = new promClient.Counter({
  name: "db_operations_total",
  help: "Total number of database operations",
  labelNames: ["operation", "collection", "status"],
  registers: [register],
});

const dbOperationDurationSeconds = new promClient.Histogram({
  name: "db_operation_duration_seconds",
  help: "Duration of database operations in seconds",
  labelNames: ["operation", "collection"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Queue metrics
const queueSizeGauge = new promClient.Gauge({
  name: "queue_current_size",
  help: "Current size of the message queue",
  labelNames: ["queue"],
  registers: [register],
});

// Custom business metrics
const itemsCreatedTotal = new promClient.Counter({
  name: "items_created_total",
  help: "Total number of items created",
  registers: [register],
});

// Function to create a prom-bundle middleware using our registry
const createMetricsMiddleware = () => {
  const promBundle = require("express-prom-bundle");
  return promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: { service: "item-service" },
    promClient: {
      collectDefaultMetrics: {
        timeout: 5000,
        register,
      },
    },
    promRegistry: register,
  });
};

module.exports = {
  register,
  metrics: {
    messagesProcessedTotal,
    messageProcessDurationSeconds,
    dbOperationsTotal,
    dbOperationDurationSeconds,
    queueSizeGauge,
    itemsCreatedTotal,
  },
  createMetricsMiddleware,
};
