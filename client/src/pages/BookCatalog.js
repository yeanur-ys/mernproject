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

  return (
    <div className="flex flex-col min-h-screen book-catalog">
  <Header user={user} setUser={setUser} />
      
      <div className="catalog-header">
        <h1 className="catalog-title">Book Catalog</h1>
        <p className="catalog-subtitle">Discover your next favorite book</p>
      </div>
      
      <div className="flex-grow">
  {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">No books available</h3>
            <p className="empty-message">Our library is currently being updated. Please check back later.</p>
          </div>
        ) : (
          <div>
            <div className="catalog-filter mb-6 p-4 bg-white rounded shadow-sm">
              <div className="filter-group">
                <label className="filter-label">Filter by Genre</label>
                <div className="filter-list">
                  {Array.from(new Set(books.map(b => b.genre).filter(Boolean))).map(g => (
                    <label key={g} className="filter-item">
                      <input
                        type="checkbox"
                        value={g}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const genre = e.target.value;
                          let next = filteredBooks.slice();
                          if (checked) {
                            // add filter: recalc from books base
                            next = books.filter(b => b.genre === genre || filteredBooks.includes(b));
                          } else {
                            // remove filter by recalculating from books excluding this genre
                            const checkedGenres = Array.from(document.querySelectorAll('.catalog-filter input[type=checkbox]:checked')).map(i => i.value).filter(Boolean);
                            if (checkedGenres.length === 0) next = books.slice();
                            else next = books.filter(b => checkedGenres.includes(b.genre));
                          }
                          setFilteredBooks(next);
                        }}
                      />
                      <span className="ml-2">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group mt-4">
                <label className="filter-label">Filter by Author</label>
                <div className="filter-list">
                  {Array.from(new Set(books.map(b => b.author).filter(Boolean))).map(a => (
                    <label key={a} className="filter-item">
                      <input
                        type="checkbox"
                        value={a}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const author = e.target.value;
                          const checkedAuthors = Array.from(document.querySelectorAll('.catalog-filter input[type=checkbox]:checked')).map(i => i.value);
                          // compute by combining checked genres/authors
                          let genres = Array.from(document.querySelectorAll('.catalog-filter > .filter-group:nth-child(1) input[type=checkbox]:checked')).map(i => i.value);
                          let authors = Array.from(document.querySelectorAll('.catalog-filter > .filter-group:nth-child(2) input[type=checkbox]:checked')).map(i => i.value);
                          if (authors.length === 0 && genres.length === 0) {
                            setFilteredBooks(books.slice());
                            return;
                          }
                          // filter books with intersection
                          const next = books.filter(b => {
                            const matchesGenre = genres.length ? genres.includes(b.genre) : true;
                            const matchesAuthor = authors.length ? authors.includes(b.author) : true;
                            return matchesGenre && matchesAuthor;
                          });
                          setFilteredBooks(next);
                        }}
                      />
                      <span className="ml-2">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

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
