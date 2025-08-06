const express = require('express');
const Book = require('../models/Book');
const authenticateJWT = require('../middleware/authMiddleware');
const router = express.Router();

// Get all books (for both member and admin)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const books = await Book.find(); // Fetch all books from MongoDB
    res.status(200).json(books); // Send books as the response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// Add a new book (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  const { title, author, imageUrl, genre } = req.body;
  const { role } = req.user;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const newBook = new Book({ title, author, imageUrl, genre });
    await newBook.save();
    res.status(201).json(newBook); // Send the newly added book as the response
  } catch (error) {
    res.status(500).json({ message: 'Error adding book' });
  }
});

// Edit a book (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  const { title, author, imageUrl, genre } = req.body;
  const { role } = req.user;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, imageUrl, genre },
      { new: true }
    );
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(updatedBook); // Send the updated book as the response
  } catch (error) {
    res.status(500).json({ message: 'Error updating book' });
  }
});

// Delete a book (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  const { role } = req.user;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book' });
  }
});

module.exports = router;
