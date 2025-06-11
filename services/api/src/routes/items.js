const express = require("express");
const router = express.Router();
const { getAllItems } = require("../services/getItemService.js");
const StatusCode = require("../config/statusCode.js");
const publish = require("../messaging/publisher.js");

// Get all items
router.get("/", async (_req, res) => {
  try {
    const result = await getAllItems();

    if (result.success) {
      // Make sure Content-Type is set to application/json
      res.status(StatusCode.OK).json(result);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(result);
    }
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to retrieve items",
    });
  }
});

// For post, use messaging to publish the item so the item service can handle it
router.post("/", async (req, res) => {
  const item = req.body;

  if (!item || !item.name || !item.message) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: "Invalid item data",
    });
  }

  // Publish the item to the messaging system
  try {
    await publish(process.env.ITEM_EXCHANGE, "item.created", item);
  } catch (error) {
    console.error("Error publishing item:", error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to publish item",
    });
  }

  // Return a success response
  return res.status(StatusCode.CREATED).json({
    success: true,
    message: "Item created successfully",
    data: item,
  });
});

module.exports = router;
