const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }
});

const CartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [CartItemSchema],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Calculate total amount before saving
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
