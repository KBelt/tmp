const { consume } = require("./consumer");
const { createItem } = require("../services/itemService");
const { metrics } = require("../services/metricsService");

async function handleMessage(msg) {
  const startTime = Date.now();

  let data;
  try {
    data = JSON.parse(msg);
  } catch (parseError) {
    console.error("Error parsing message JSON:", parseError);
    throw parseError;
  }

  // Extract name and message with safe fallbacks
  const name = data.name || (data.value && data.value.name) || "Unknown";
  const message =
    data.message || (data.value && data.value.message) || "No message";

  // save the item to the database
  try {
    const item = await createItem(name, message);
    console.log(
      `Create item for name: '${item.name}' with message '${item.message}'`
    );

    // Record successful processing metrics
    metrics.messagesProcessedTotal.inc({ status: "success" });
    metrics.messageProcessDurationSeconds.observe(
      { status: "success" },
      (Date.now() - startTime) / 1000
    );
    metrics.itemsCreatedTotal.inc();
    return item;
  } catch (error_1) {
    console.error("Error creating item:", error_1);

    // Record failed processing metrics
    metrics.messagesProcessedTotal.inc({ status: "error" });
    metrics.messageProcessDurationSeconds.observe(
      { status: "error" },
      (Date.now() - startTime) / 1000
    );

    throw error_1;
  }
}

function startConsumer() {
  // Start consuming messages from the target exchange
  consume(
    process.env.ITEM_EXCHANGE,
    process.env.ITEM_SERVICE_QUEUE,
    "item.created",
    handleMessage
  );
}

module.exports = { startConsumer, handleMessage };
