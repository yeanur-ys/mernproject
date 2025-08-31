const express = require('express');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const authenticateJWT = require('../middleware/authMiddleware');
const router = express.Router();

// Helper function to calculate due date (1 week from current date)
function calculateDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
  return dueDate;
}

// GET all borrows (admin only)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }
    
    const borrows = await Borrow.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title author imageUrl');
      
    res.json(borrows);
  } catch (err) {
    console.error('Error fetching borrows:', err);
    res.status(500).json({ message: 'Error fetching borrow records' });
  }
});

// GET user's borrows
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    console.log('Getting borrows for user:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const borrows = await Borrow.find({ userId: req.user.userId })
      .populate('bookId', 'title author imageUrl');
    
    console.log(`Found ${borrows.length} borrows for user ${req.user.userId}`);
      
    // Calculate current late fees for books not yet returned
    const borrowsWithUpdatedFees = borrows.map(borrow => {
      const borrowObj = borrow.toObject();
      
      // If not returned yet, calculate current fee
      if (!borrowObj.returnDate) {
        borrowObj.currentFine = calculateFine(borrowObj.dueDate, new Date());
      }
      
      return borrowObj;
    });
    
    res.json(borrowsWithUpdatedFees);
  } catch (err) {
    console.error('Error fetching user borrows:', err);
    res.status(500).json({ message: 'Error fetching your borrowed books' });
  }
});

// POST /borrow - Borrow a book
router.post('/borrow', authenticateJWT, async (req, res) => {
  console.log('Borrow request received:', req.body);
  console.log('User from token:', req.user);
  
  const { bookId } = req.body;
  if (!bookId) {
    return res.status(400).json({ message: 'Book ID is required' });
  }
  
  const dueDate = calculateDueDate();
  console.log('Due date calculated:', dueDate);

  try {
    console.log('Looking for book with ID:', bookId);
    const book = await Book.findById(bookId);
    console.log('Book found:', book ? 'Yes' : 'No');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if the book is available
    if (!book.isAvailable) {
      return res.status(400).json({ message: 'This book is currently not available' });
    }
    
    // Check if user already has this book
    const existingBorrow = await Borrow.findOne({ 
      userId: req.user.userId,
      bookId: bookId,
      returnDate: null // Not yet returned
    });
    
    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    const borrow = new Borrow({
      userId: req.user.userId,
      bookId,
      dueDate,
    });
    
    // Mark the book as unavailable
    book.isAvailable = false;
    book.currentBorrowerId = req.user.userId;
    book.borrowHistory.push(borrow._id);

    await borrow.save();
    await book.save();
    
    // Update user's borrowed books
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { borrowedBooks: bookId }
    });
    
    res.status(201).json({ 
      message: 'Book borrowed successfully', 
      dueDate: dueDate,
      borrow: await borrow.populate('bookId', 'title author')
    });
  } catch (err) {
    console.error('Error borrowing book:', err);
    res.status(500).json({ message: 'Error borrowing book' });
  }
});

// POST /return - Return a borrowed book
router.post('/return', authenticateJWT, async (req, res) => {
  const { borrowId } = req.body;
  console.log('Return request for borrow ID:', borrowId);
  console.log('User from token:', req.user);
  
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'User ID not found in token' });
  }

  try {
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    
    console.log('Found borrow record:', borrow);
    
    // Check if book belongs to user or user is admin
    if (borrow.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to return this book' });
    }
    
    // Check if already returned
    if (borrow.returnDate) {
      return res.status(400).json({ message: 'Book already returned' });
    }

    const returnDate = new Date();
    borrow.returnDate = returnDate;

    const fine = calculateFine(borrow.dueDate, returnDate);
    borrow.fine = fine;

    await borrow.save();
    
    // Mark the book as available again
    await Book.findByIdAndUpdate(borrow.bookId, {
      isAvailable: true,
      currentBorrowerId: null
    });
    
    // Remove from user's borrowed books
    await User.findByIdAndUpdate(borrow.userId, {
      $pull: { borrowedBooks: borrow.bookId }
    });
    
    res.status(200).json({ 
      message: 'Book returned successfully', 
      fine: fine > 0 ? `Late fee: ${fine}tk` : 'No late fee',
      borrow 
    });
  } catch (err) {
    console.error('Error returning book:', err);
    res.status(500).json({ message: 'Error returning book' });
  }
});

// GET total late fees for a user
router.get('/fees', authenticateJWT, async (req, res) => {
  try {
    console.log('Calculating fees for user:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    // Get all borrows for user
    const borrows = await Borrow.find({ userId: req.user.userId });
    console.log(`Found ${borrows.length} borrows for fee calculation`);
    
    let totalFine = 0;
    let currentLateFees = 0;
    
    borrows.forEach(borrow => {
      // Add recorded fines for returned books
      if (borrow.returnDate) {
        totalFine += borrow.fine;
      } else {
        // Calculate current late fees for books not yet returned
        const currentFine = calculateFine(borrow.dueDate, new Date());
        currentLateFees += currentFine;
      }
    });
    
    res.json({
      totalPaidFines: totalFine,
      currentLateFees,
      totalFines: totalFine + currentLateFees
    });
  } catch (err) {
    console.error('Error calculating fees:', err);
    res.status(500).json({ message: 'Error calculating late fees' });
  }
});

// Function to calculate fine (10tk per day)
function calculateFine(dueDate, returnDate) {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  
  // If returned before or on due date, no fee
  if (returned <= due) return 0;
  
  // Calculate days difference
  const diffTime = Math.abs(returned - due);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 10tk per day
  return diffDays * 10;
}

// Get book borrowing statistics for admin
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }
    
    // Count total borrows
    const totalBorrows = await Borrow.countDocuments();
    
    // Count active borrows (not returned)
    const activeBorrows = await Borrow.countDocuments({ returnDate: null });
    
    // Calculate total late fees
    const allBorrows = await Borrow.find();
    let totalFees = 0;
    
    allBorrows.forEach(borrow => {
      if (borrow.returnDate) {
        totalFees += borrow.fine;
      } else {
        totalFees += calculateFine(borrow.dueDate, new Date());
      }
    });
    
    // Get most borrowed books
    const bookStats = await Borrow.aggregate([
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate book details
    const topBooks = [];
    for (const stat of bookStats) {
      const book = await Book.findById(stat._id);
      if (book) {
        topBooks.push({
          book: {
            _id: book._id,
            title: book.title,
            author: book.author
          },
          borrowCount: stat.count
        });
      }
    }
    
    res.json({
      totalBorrows,
      activeBorrows,
      totalFees,
      topBooks
    });
  } catch (err) {
    console.error('Error getting borrow statistics:', err);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
