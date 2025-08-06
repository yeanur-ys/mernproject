const express = require('express');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const authenticateJWT = require('../middleware/authMiddleware');
const router = express.Router();

// POST /borrow - Borrow a book
router.post('/borrow', authenticateJWT, async (req, res) => {
  const { bookId, dueDate } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(400).json({ message: 'Book not found' });
    }

    const borrow = new Borrow({
      userId: req.user.userId,
      bookId,
      dueDate,
    });

    await borrow.save();
    res.status(201).json({ message: 'Book borrowed successfully', borrow });
  } catch (err) {
    res.status(500).json({ message: 'Error borrowing book' });
  }
});

// POST /return - Return a borrowed book
router.post('/return', authenticateJWT, async (req, res) => {
  const { borrowId } = req.body;

  try {
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(400).json({ message: 'Borrow record not found' });
    }

    const returnDate = new Date();
    borrow.returnDate = returnDate;

    const fine = calculateFine(borrow.dueDate, returnDate);
    borrow.fine = fine;

    await borrow.save();
    res.status(200).json({ message: 'Book returned successfully', borrow });
  } catch (err) {
    res.status(500).json({ message: 'Error returning book' });
  }
});

// Function to calculate fine
function calculateFine(dueDate, returnDate) {
  const diffInMs = returnDate - new Date(dueDate);
  const diffInDays = diffInMs / (1000 * 3600 * 24);
  if (diffInDays <= 0) return 0; // No fine if returned on time
  return diffInDays * 1; // Fine per day
}

module.exports = router;
