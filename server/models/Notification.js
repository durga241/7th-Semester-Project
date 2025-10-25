const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Index for faster queries
  },
  type: { 
    type: String, 
    enum: ['order', 'payment', 'feedback', 'system'], 
    default: 'order' 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  read: { 
    type: Boolean, 
    default: false,
    index: true
  },
  metadata: {
    customerName: String,
    orderTotal: Number,
    productCount: Number
  }
}, { timestamps: true });

// Index for efficient queries
NotificationSchema.index({ farmerId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
