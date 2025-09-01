import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingPage from '../components/LoadingPage';

const BookDetails = ({ user, setUser }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState('');
  const [borrowError, setBorrowError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
  const response = await axios.get(`/books/${id}`);
        setBook(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) return <LoadingPage message="Loading book" />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!book) return <div className="p-8 text-center">Book not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
  <Header user={user} setUser={setUser} />
      <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
        <Link to="/catalog" className="text-blue-500 hover:text-blue-700 flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Catalog
        </Link>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="md:flex">
            <img src={book.imageUrl || 'https://via.placeholder.com/300'} alt={book.title} className="md:w-1/3 object-cover rounded mb-4 md:mb-0 md:mr-6" />
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <h2 className="text-xl text-gray-700 mb-2">by {book.author}</h2>
              {book.genre && <p className="text-blue-500 mb-4">Genre: {book.genre}</p>}
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{book.description || 'No description available.'}</p>
              </div>

              {/* Borrow status */}
              <div className="mt-6 p-3 rounded-md bg-gray-50">
                <h3 className="font-semibold mb-1">Availability Status</h3>
                {book.isAvailable ? (
                  <div className="text-green-600">Available for borrowing</div>
                ) : (
                  <div className="text-red-600">Currently borrowed</div>
                )}
              </div>
              
              {/* Borrow button (hidden for admins) */}
              {user && book.isAvailable && user.role !== 'admin' && (
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      if (!user) {
                        setBorrowError('You must be logged in to borrow books');
                        return;
                      }
                      
                      try {
                        setBorrowing(true);
                        setBorrowError('');
                        setBorrowSuccess('');
                        
                        console.log('Attempting to borrow book with ID:', book._id);
                        
                        const response = await axios.post('/borrows/borrow', {
                          bookId: book._id
                        });
                        
                        console.log('Borrow response:', response.data);
                        
                        setBorrowSuccess(`Book borrowed successfully! Due date: ${new Date(response.data.dueDate).toLocaleDateString()}`);
                        setBook({ ...book, isAvailable: false });
                      } catch (err) {
                        console.error('Borrow error:', err);
                        setBorrowError(err.response?.data?.message || err.message || 'Failed to borrow book');
                      } finally {
                        setBorrowing(false);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={borrowing}
                  >
                    {borrowing ? 'Processing...' : 'Borrow This Book'}
                  </button>
                  
                  {borrowSuccess && (
                    <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
                      {borrowSuccess}
                    </div>
                  )}
                  
                  {borrowError && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                      {borrowError}
                    </div>
                  )}
                </div>
              )}
              
              {!user && (
                <div className="mt-4 p-2 bg-blue-100 text-blue-800 rounded">
                  <Link to="/login" className="font-medium underline">Log in</Link> to borrow this book.
                </div>
              )}

              {user && user.role === 'admin' && (
                <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
                  Admins cannot borrow books here. Use the Admin Dashboard to manage borrows.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookDetails;
