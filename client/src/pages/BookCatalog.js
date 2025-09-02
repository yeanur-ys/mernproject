import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingPage from '../components/LoadingPage';
import '../styles/BookCatalog.css';
import '../styles/AdminPanel.css';

const BookCatalog = ({ user: propUser, setUser }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const user = propUser || null;
  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
  console.log('Starting to fetch books...');
  const response = await axios.get('/books');
        console.log('Books API response:', response.data);
  setBooks(response.data);
  setFilteredBooks(response.data);
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

  if (loading) return <LoadingPage message="Loading catalog" />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  // Recompute filteredBooks when filter selections change
  useEffect(() => {
    let next = books.slice();
    if (selectedGenres.length) next = next.filter(b => selectedGenres.includes(b.genre));
    if (selectedAuthors.length) next = next.filter(b => selectedAuthors.includes(b.author));
    setFilteredBooks(next);
  }, [books, selectedGenres, selectedAuthors]);

  return (
    <div className="flex flex-col min-h-screen book-catalog">
      <Header user={user} setUser={setUser} />

      <div className="catalog-header">
        <h1 className="catalog-title">Book Catalog</h1>
        <p className="catalog-subtitle">Discover your next favorite book</p>
      </div>

      <div className="flex-grow max-w-6xl mx-auto w-full p-6">
        <div className="catalog-filter mb-6 p-4 bg-white rounded shadow-sm">
          <div className="filter-row flex flex-wrap gap-4 items-end">
            <div className="filter-group">
              <label className="filter-label">Filter by Genre</label>
              <div className="filter-list">
                {Array.from(new Set(books.map(b => b.genre).filter(Boolean))).map(g => (
                  <label key={g} className="filter-item">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(g)}
                      onChange={() => setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                    />
                    <span className="ml-2">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Filter by Author</label>
              <div className="filter-list">
                {Array.from(new Set(books.map(b => b.author).filter(Boolean))).map(a => (
                  <label key={a} className="filter-item">
                    <input
                      type="checkbox"
                      checked={selectedAuthors.includes(a)}
                      onChange={() => setSelectedAuthors(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                    />
                    <span className="ml-2">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="ml-auto">
              <button onClick={() => { setSelectedGenres([]); setSelectedAuthors([]); }} className="p-2 bg-gray-100 rounded">Clear filters</button>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">No books available</h3>
            <p className="empty-message">Our library is currently being updated. Please check back later.</p>
          </div>
        ) : (
          <div className="books-list">
            {filteredBooks.map(book => (
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
                    to={`/books/${book._id}`}
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
