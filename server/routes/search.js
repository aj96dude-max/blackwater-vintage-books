const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const SearchLog = require('../models/SearchLog');

// Store active notification listeners for live Admin Portal alerts
const alertListeners = new Set();

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Search query cannot be empty." });
    }

    const cleanQuery = query.trim();
    const hits = await Book.searchByQuery(cleanQuery);

    if (hits && hits.length > 0) {
      // Hit Logic: Book exists in inventory
      return res.json({
        status: "hit",
        query: cleanQuery,
        results: hits
      });
    } else {
      // Miss Logic (Automation Hook): Book not found in inventory
      const logEntry = await SearchLog.recordMiss(cleanQuery);

      // Trigger notification alerting developers that a missing book was queried
      const alertPayload = {
        type: "DISCRETE_VARIATION_MISS",
        query: cleanQuery,
        requestCount: logEntry ? logEntry.requestCount : 1,
        timestamp: new Date().toISOString()
      };

      for (const listener of alertListeners) {
        try {
          listener(alertPayload);
        } catch (e) {
          console.error("Error sending alert to listener:", e);
        }
      }

      return res.json({
        status: "miss",
        query: cleanQuery,
        message: "Not currently in stock, but available soon.",
        log: logEntry
      });
    }
  } catch (err) {
    console.error("Error executing discrete variation search:", err);
    res.status(500).json({ error: "Search engine error." });
  }
});

module.exports = {
  router,
  alertListeners
};
