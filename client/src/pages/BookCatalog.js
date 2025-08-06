import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch books
      axios.get('http://localhost:5000/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => setBooks(response.data))
        .catch(error => console.log(error));

      // Check if the user is an admin
      const user = JSON.parse(atob(token.split('.')[1]));
      if (user.role === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleDelete = async (bookId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter(book => book._id !== bookId)); // Remove the deleted book from the list
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Book Catalog</h1>
      {isAdmin && (
        <Link to="/admin">
          <button className="px-6 py-3 bg-yellow-500 text-white rounded-md mb-4">
            Admin Panel (Manage Books)
          </button>
        </Link>
      )}
      <div className="grid grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book._id} className="p-4 border border-gray-300 rounded-md">
            <img
              src={book.imageUrl}
              alt={book.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3 className="text-lg font-bold">{book.title}</h3>
            <p className="text-sm text-gray-500">by {book.author}</p>
            <Link to={`/book/${book._id}`} className="text-blue-500">View Details</Link>
            {isAdmin && (
              <div className="mt-4">
                <button
                  onClick={() => handleDelete(book._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                >
                  Delete
                </button>
                <Link to={`/admin/edit/${book._id}`}>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                    Edit
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookCatalog;
