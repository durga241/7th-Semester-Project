const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/check-user', authController.checkUserExists);
router.post('/register', authController.register);

// Password-based authentication (NEW)
router.post('/signup', authController.passwordRegister);  // For new auth system
router.post('/login', authController.passwordLogin);      // For new auth system
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-reset-token/:token', async (req, res) => {
  // Simple token verification endpoint
  try {
    const { token } = req.params;
    const User = require('../models/User');
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: new Date() } 
    });
    if (!user) {
      return res.status(400).json({ ok: false, error: 'Invalid or expired token' });
    }
    return res.json({ ok: true, message: 'Token is valid' });
  } catch (err) {
    return res.status(400).json({ ok: false, error: 'Invalid token' });
  }
});

// OTP-based authentication (EXISTING)
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
