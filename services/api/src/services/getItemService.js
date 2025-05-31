const Item = require("../models/item.js");

/**
 * Service to retrieve all items from the database
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>} Result object with data or error
 */
const getAllItems = async () => {
  try {
    const items = await Item.find({});
    return {
      success: true,
      count: items.length,
      data: items,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to retrieve items",
    };
  }
};
module.exports = {
  getAllItems,
};
