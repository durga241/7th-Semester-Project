const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
  visibility: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
