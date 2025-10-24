const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['farmer', 'customer'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  password: { type: String }, // Optional: for password-based login
  
  // Google OAuth fields
  googleId: { type: String, sparse: true, unique: true },
  profilePicture: { type: String },
  
  // Farmer-specific fields
  farmLocation: { type: String },
  cropsGrown: [{ type: String }],
  
  // Verification
  isVerified: { type: Boolean, default: false },
  otpVerified: { type: Boolean, default: false },
  
  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
