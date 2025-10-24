const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'customer'], default: 'customer' },
  name: { type: String },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// TTL index: expiresAt will auto-delete after it passes
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', OtpSchema);


