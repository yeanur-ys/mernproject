import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookDetails = () => {
  const [book, setBook] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(response => setBook(response.data))
      .catch(error => console.log(error));
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
      <h2 className="text-xl font-semibold mb-4">by {book.author}</h2>
      <p className="mb-4">Genre: {book.genre}</p>
      <img src={book.imageUrl} alt={book.title} className="w-full h-96 object-cover rounded-md mb-4" />
      <p>{book.description}</p>
    </div>
  );
};

export default BookDetails;
