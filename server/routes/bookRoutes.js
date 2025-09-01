const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const authenticateJWT = require('../middleware/auth');

// Get all books (public access)
router.get('/', async (req, res) => {
  try {
    console.log('Getting all books');
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// Get a specific book by ID (public access)
router.get('/:id', async (req, res) => {
  try {
    console.log(`Getting book with ID: ${req.params.id}`);
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error getting book by ID:', error);
    res.status(500).json({ message: 'Error fetching book details', error: error.message });
  }
});

// Create a new book (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add books' });
    }
    
    const { title, author, imageUrl, genre } = req.body;
    
    // Validate required fields
    if (!title || !author || !imageUrl || !genre) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newBook = new Book({
      title,
      author,
      imageUrl,
      genre,
      isAvailable: true
    });
    
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
});

// Update a book (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update books' });
    }
    
    const { title, author, imageUrl, genre } = req.body;
    
    // Validate required fields
    if (!title || !author || !imageUrl || !genre) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Update fields
    book.title = title;
    book.author = author;
    book.imageUrl = imageUrl;
    book.genre = genre;
    
    await book.save();
    res.status(200).json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// Delete a book (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete books' });
    }
    
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

// Export routes
module.exports = router;
