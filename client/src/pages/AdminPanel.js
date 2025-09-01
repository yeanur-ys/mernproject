import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BorrowedBooks from '../components/BorrowedBooks';
import AddBook from '../components/AddBook';

const AdminPanel = ({ user: propUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    imageUrl: '',
    genre: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(propUser || null);
  const [activeTab, setActiveTab] = useState('addBook'); // 'addBook', 'editBook', or 'borrowed'
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Update local user when prop changes
    setUser(propUser || null);

    // Redirect if not admin
    if (!propUser) {
      navigate('/login');
      return;
    }
    if (propUser.role !== 'admin') {
      navigate('/');
      return;
    }
    
    if (id) {
      // If there's an ID in the URL, it means we are editing a book
      setIsEdit(true);
      setActiveTab('editBook');
      axios.get(`/books/${id}`)
        .then(response => {
          setFormData({
            title: response.data.title,
            author: response.data.author,
            imageUrl: response.data.imageUrl,
            genre: response.data.genre,
          });
        })
        .catch(error => console.log(error));
    }
  }, [id, navigate]);

  useEffect(() => {
    // When switched to borrowed tab, ensure BorrowedBooks fetches current data by re-mounting
    // Force a small state ripple by toggling activeTab briefly if needed (no-op here)
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`/books/${id}`, formData);
        alert('Book updated successfully!');
      } else {
        await axios.post('/books', formData);
        alert('Book added successfully!');
      }
      navigate('/catalog');
    } catch (err) {
      setError('Error while saving book: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="flex-grow p-8 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b">
          <div className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('addBook')}
              className={`mr-4 py-2 px-4 border-b-2 ${
                activeTab === 'addBook' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Add New Book
            </button>
            {isEdit && (
              <button
                onClick={() => setActiveTab('editBook')}
                className={`mr-4 py-2 px-4 border-b-2 ${
                  activeTab === 'editBook' 
                    ? 'border-blue-500 text-blue-500' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Edit Book
              </button>
            )}
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`mr-4 py-2 px-4 border-b-2 ${
                activeTab === 'borrowed' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              Borrowed Books
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'addBook' && (
          <AddBook onBookAdded={() => setError('')} />
        )}
        
        {activeTab === 'editBook' && isEdit && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Edit Book</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Book Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Author Name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  Book Cover Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/book-cover.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="genre">
                  Genre
                </label>
                <select
                  id="genre"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                >
                  <option value="">Select a genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Biography">Biography</option>
                  <option value="History">History</option>
                  <option value="Children">Children</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="flex-1 p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Update Book
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/admin')}
                  className="flex-1 p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
          </div>
        )}
        
        {activeTab === 'borrowed' && (
          <BorrowedBooks />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
