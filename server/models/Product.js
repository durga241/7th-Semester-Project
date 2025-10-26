const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'unavailable', 'out_of_stock'], default: 'available' },
  visibility: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // Discount percentage (0-100)
  offerStartDate: { type: Date }, // When the offer starts
  offerEndDate: { type: Date }, // When the offer expires
  offerExpired: { type: Boolean, default: false }, // Flag to mark expired offers
  smsNotificationSent: { type: Boolean, default: false }, // Track if 3-hour warning SMS was sent
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
