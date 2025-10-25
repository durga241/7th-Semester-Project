const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // Human-readable order ID like "ORD1234567"
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentInfo: {
    method: { type: String, enum: ['razorpay', 'stripe', 'cod', 'upi'], default: 'razorpay' },
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled', 'expired'], default: 'pending' },
    // Razorpay fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    // Stripe fields
    stripeSessionId: { type: String },
    stripePaymentId: { type: String }
  },
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date }
  }
}, { timestamps: true });

// Generate orderId before saving
OrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    // Generate a random 7-digit number
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    this.orderId = `ORD${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
