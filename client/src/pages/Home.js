import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingPage from '../components/LoadingPage';
// MyBorrows removed from Home; users should go to /dashboard to view borrows
import axios from '../axios';
import '../styles/HomePage.css';

const Home = ({ user, setUser }) => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await axios.get('/books?limit=4');
        setFeaturedBooks(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching books', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedBooks();
  }, []);
  if (loading) return <LoadingPage message="Loading home" />;
  
  return (
    <div className="home-page">
  <Header user={user} setUser={setUser} />
      
      <main className="home-container">
        {/* Hero section */}
        <section className="hero-section">
          <h1 className="hero-title">Welcome to the Library</h1>
          <p className="hero-subtitle">
            Discover thousands of books and resources at your fingertips. 
            Browse our catalog, borrow books, and enjoy reading.
          </p>
          {user ? (
            <Link to="/catalog" className="hero-button">Browse Catalog</Link>
          ) : (
            <Link to="/signup" className="hero-button">Sign Up to Browse</Link>
          )}
        </section>
        
  {/* MyBorrows removed from home — dedicated dashboard available at /dashboard */}
        
        {/* Features section */}
        <section className="features-section">
          <h2 className="section-title">What We Offer</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Extensive Collection</h3>
              <p>Access thousands of books across multiple genres, from classics to contemporary bestsellers.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Easy Search</h3>
              <p>Find exactly what you're looking for with our powerful search and filter system.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Digital Access</h3>
              <p>Access your account, check due dates, and manage your borrowed books from anywhere.</p>
            </div>
          </div>
        </section>
        
        {/* Popular books section */}
        <section className="popular-books">
          <h2 className="section-title">Popular Books</h2>
          
          <div className="books-grid">
            {featuredBooks.length > 0 ? (
              featuredBooks.map((book) => (
                <div className="book-card" key={book._id}>
                  <img 
                    src={book.imageUrl || 'https://via.placeholder.com/300x400?text=Book+Cover'} 
                    alt={book.title}
                    className="book-image"
                  />
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <Link to={`/books/${book._id}`} className="book-button">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Placeholder books if none are available from the API */}
                <div className="book-card">
                  <img src="https://via.placeholder.com/300x400?text=Book+Cover" alt="Placeholder" className="book-image" />
                  <div className="book-info">
                    <h3 className="book-title">The Great Gatsby</h3>
                    <p className="book-author">by F. Scott Fitzgerald</p>
                    <Link to="/catalog" className="book-button">View Details</Link>
                  </div>
                </div>
                
                <div className="book-card">
                  <img src="https://via.placeholder.com/300x400?text=Book+Cover" alt="Placeholder" className="book-image" />
                  <div className="book-info">
                    <h3 className="book-title">To Kill a Mockingbird</h3>
                    <p className="book-author">by Harper Lee</p>
                    <Link to="/catalog" className="book-button">View Details</Link>
                  </div>
                </div>
                
                <div className="book-card">
                  <img src="https://via.placeholder.com/300x400?text=Book+Cover" alt="Placeholder" className="book-image" />
                  <div className="book-info">
                    <h3 className="book-title">1984</h3>
                    <p className="book-author">by George Orwell</p>
                    <Link to="/catalog" className="book-button">View Details</Link>
                  </div>
                </div>
                
                <div className="book-card">
                  <img src="https://via.placeholder.com/300x400?text=Book+Cover" alt="Placeholder" className="book-image" />
                  <div className="book-info">
                    <h3 className="book-title">Pride and Prejudice</h3>
                    <p className="book-author">by Jane Austen</p>
                    <Link to="/catalog" className="book-button">View Details</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
        
        {/* Call to action section */}
        <section className="cta-section">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">
            Join our library today and get access to thousands of books. 
            Sign up now or browse our catalog to see what's available.
          </p>
          {user ? (
            <Link to="/catalog" className="hero-button">Browse Books</Link>
          ) : (
            <Link to="/signup" className="hero-button">Sign Up Now</Link>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
