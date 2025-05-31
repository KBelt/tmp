const express = require("express");
const router = express.Router();
const { register } = require("../metrics/metrics");

// Metrics endpoint
router.get("/", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).send("Error generating metrics");
  }
});

module.exports = router;
