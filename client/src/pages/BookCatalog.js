import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { jwtDecode } from 'jwt-decode';
import '../styles/BookCatalog.css';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Check for authentication
        const token = localStorage.getItem('token');
        if (token) {
          try {
            console.log('Decoding token in BookCatalog.js:', token);
            const decoded = jwtDecode(token);
            console.log('Decoded token in BookCatalog.js:', decoded);
            setUser(decoded);
            setIsAdmin(decoded.role === 'admin');
          } catch (error) {
            console.error('Invalid token in BookCatalog.js:', error);
            localStorage.removeItem('token');
          }
        }
        
        console.log('Starting to fetch books...');
        const response = await axios.get('/books');
        console.log('Books API response:', response.data);
        setBooks(response.data);
      } catch (err) {
        console.error('Error details:', err);
        console.error('Response data:', err.response?.data);
        console.error('Response status:', err.response?.status);
        setError('Failed to load books. See console for details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading books...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen book-catalog">
      <Header user={user} />
      
      <div className="catalog-header">
        <h1 className="catalog-title">Book Catalog</h1>
        <p className="catalog-subtitle">Discover your next favorite book</p>
      </div>
      
      <div className="flex-grow">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">No books available</h3>
            <p className="empty-message">Our library is currently being updated. Please check back later.</p>
          </div>
        ) : (
          <div className="books-list">
            {books.map(book => (
              <div key={book._id} className="book-item">
                <div className="book-image-container">
                  <img 
                    src={book.imageUrl || 'https://via.placeholder.com/300x200?text=Book+Cover'} 
                    alt={book.title} 
                    className="book-image" 
                  />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  {book.genre && <span className="book-genre">{book.genre}</span>}
                  <div className="book-status mt-2">
                    {book.isAvailable !== false ? (
                      <span className="available-badge">Available</span>
                    ) : (
                      <span className="borrowed-badge">Borrowed</span>
                    )}
                  </div>
                  <Link 
                    to={`/book/${book._id}`} 
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookCatalog;
