const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    reviewerName: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ book: 1 });

module.exports = mongoose.model('Review', reviewSchema);
