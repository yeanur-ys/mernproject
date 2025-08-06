import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    imageUrl: '',
    genre: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      // If there's an ID in the URL, it means we are editing a book
      setIsEdit(true);
      axios.get(`http://localhost:5000/api/books/${id}`)
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
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/books/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Book updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/books', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Book added successfully!');
      }
      navigate('/catalog');
    } catch (err) {
      setError('Error while saving book');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">{isEdit ? 'Edit Book' : 'Add Book'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Book Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
        />
        <button type="submit" className="w-full p-2 bg-green-500 text-white rounded-md">
          {isEdit ? 'Update Book' : 'Add Book'}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default AdminPanel;
