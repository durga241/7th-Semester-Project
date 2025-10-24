const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  farmLocation: { type: String },
  cropTypes: [{ type: String }],
  googleId: { type: String },
  profilePhoto: { type: String },
  role: { type: String, enum: ['farmer', 'customer'], default: 'farmer' },
  otpCode: { type: String, required: true }, // Hashed OTP
  otpAttempts: { type: Number, default: 0 }, // Track failed attempts
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // Auto-delete after expiry
}, { timestamps: true });

module.exports = mongoose.model('PendingUser', PendingUserSchema);
