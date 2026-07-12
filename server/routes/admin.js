const express = require('express');
const router = express.Router();
const SearchLog = require('../models/SearchLog');
const { alertListeners } = require('./search');

// GET all search logs (Discrete Variation queries)
router.get('/logs', async (req, res) => {
  try {
    const logs = await SearchLog.findAll();
    res.json(logs);
  } catch (err) {
    console.error("Error fetching search logs:", err);
    res.status(500).json({ error: "Failed to retrieve discrete variation logs." });
  }
});

// PUT update status of a search log
router.put('/logs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Added', 'Ignored'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    const updated = await SearchLog.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: "Search log entry not found." });
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating search log status:", err);
    res.status(500).json({ error: "Failed to update log status." });
  }
});

// GET Server-Sent Events stream for live requisition alerts
router.get('/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const listener = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  alertListeners.add(listener);

  req.on('close', () => {
    alertListeners.delete(listener);
  });
});

module.exports = router;
