const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const booksRouter = require('./routes/books');
const { router: searchRouter } = require('./routes/search');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from /client directory
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/books', booksRouter);
app.use('/api/search', searchRouter);
app.use('/api/admin', adminRouter);

// Fallback to client/index.html for any non-API route (supports SPA navigation or admin tab)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: "API endpoint not found." });
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initSqlJsDb();
    app.listen(PORT, () => {
      console.log(`================================================================`);
      console.log(`Blackwater & Co. Vintage Bookstore Server EST. 1899`);
      console.log(`Storefront Gallery: http://localhost:${PORT}`);
      console.log(`Admin Portal CMS:   http://localhost:${PORT}/admin`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
