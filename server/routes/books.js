const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const SearchLog = require('../models/SearchLog');

// GET all books (optional ?genre= filter)
router.get('/', async (req, res) => {
  try {
    const { genre } = req.query;
    const books = await Book.findAll(genre);
    res.json(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to retrieve ledger volumes." });
  }
});

// GET single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Volume not found in catalog." });
    }
    res.json(book);
  } catch (err) {
    console.error("Error fetching volume:", err);
    res.status(500).json({ error: "Failed to retrieve volume." });
  }
});

// POST create new book (CRUD Create)
router.post('/', async (req, res) => {
  try {
    const { title, author, genre, coverImageUrl, description, excerpt, stockStatus, price } = req.body;
    if (!title || !author || !genre) {
      return res.status(400).json({ error: "Title, Author, and Genre are required." });
    }

    const newBook = await Book.create({
      title,
      author,
      genre,
      coverImageUrl,
      description,
      excerpt,
      stockStatus,
      price
    });

    // Automatically check if there is a pending discrete variation query for this exact title and mark as Added!
    await SearchLog.markAddedByQuery(title);

    res.status(201).json(newBook);
  } catch (err) {
    console.error("Error creating volume:", err);
    res.status(500).json({ error: "Failed to create new volume entry." });
  }
});

// PUT update existing book (CRUD Update)
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.update(req.params.id, req.body);
    if (!updatedBook) {
      return res.status(404).json({ error: "Volume not found in catalog." });
    }
    res.json(updatedBook);
  } catch (err) {
    console.error("Error updating volume:", err);
    res.status(500).json({ error: "Failed to update volume." });
  }
});

// DELETE remove book (CRUD Delete)
router.delete('/:id', async (req, res) => {
  try {
    const success = await Book.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Volume not found." });
    }
    res.json({ message: "Volume successfully removed from ledger." });
  } catch (err) {
    console.error("Error deleting volume:", err);
    res.status(500).json({ error: "Failed to remove volume." });
  }
});

module.exports = router;
