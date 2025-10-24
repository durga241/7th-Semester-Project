const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Create compound index to prevent duplicate wishlist entries
WishlistSchema.index({ customerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
