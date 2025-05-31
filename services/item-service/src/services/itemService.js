const Item = require("../models/item");
const { getDb } = require("../database/database");
const { metrics } = require("../services/metricsService");

const createItem = async (name, message) => {
  const startTime = Date.now();

  try {
    // Create a new item object
    const item = new Item({
      name,
      message,
    });

    const db = getDb();

    // Insert the item into the database
    const result = await db.collection("item").insertOne({
      name: item.name,
      message: item.message,
      createdAt: new Date(),
    });

    // Record successful DB operation metrics
    metrics.dbOperationsTotal.inc({
      operation: "insert",
      collection: "item",
      status: "success",
    });

    metrics.dbOperationDurationSeconds.observe(
      { operation: "insert", collection: "item" },
      (Date.now() - startTime) / 1000
    );

    // Add the ID to our item object
    item._id = result.insertedId;

    console.log(`Item created with ID: ${result.insertedId}`);
    return item;
  } catch (error) {
    // Record failed DB operation metrics
    metrics.dbOperationsTotal.inc({
      operation: "insert",
      collection: "item",
      status: "error",
    });

    metrics.dbOperationDurationSeconds.observe(
      { operation: "insert", collection: "item" },
      (Date.now() - startTime) / 1000
    );

    console.error(`Failed to create item: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createItem,
};
