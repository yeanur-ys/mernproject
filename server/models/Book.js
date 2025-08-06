const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  genre: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
