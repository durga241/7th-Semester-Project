const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { JWT_SECRET } = require('../middleware/auth');
const { sendEmail, buildOtpEmailHtml, buildWelcomeEmailHtml } = require('../utils/email');
const { generateOtpCode } = require('../utils/otp');

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 300);
const otpStore = new Map(); // Fallback in-memory storage

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, name, role = 'customer', phone } = req.body || {};
    
    if (!email || !name) {
      return res.status(400).json({ ok: false, error: 'Email and name are required' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        ok: false, 
        error: 'User already exists. Please login instead.'
      });
    }
    
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      role: role,
      phone: phone || ''
    });
    
    await newUser.save();
    console.log(`✅ User registered: ${newUser.email} (${newUser.role})`);

    // Auto-login: create JWT token
    const token = jwt.sign({ 
      uid: newUser._id,
      role: newUser.role,
      email: newUser.email
    }, JWT_SECRET, { expiresIn: '30d' });

    // Send welcome email (non-blocking)
    setImmediate(async () => {
      try {
        await sendEmail(
          newUser.email,
          '🌾 Welcome to FarmConnect!',
          buildWelcomeEmailHtml(newUser.name, newUser.role),
          `Welcome to FarmConnect, ${newUser.name}! Your account has been created as a ${newUser.role}.`
        );
      } catch (e) {
        console.log('⚠️ Welcome email send failed:', e?.message);
      }
    });

    res.json({
      ok: true,
      message: 'Registration successful! You are now logged in.',
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone
      }
    });
    
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ ok: false, error: String(err?.message || 'Registration failed') });
  }
};

// Password-based register (keeps OTP flow untouched)
exports.passwordRegister = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Name, email and password are required' });
    }

    if (!String(email).includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.password) {
      return res.status(409).json({ ok: false, error: 'User already exists. Please login.' });
    }

    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(String(password), 10);

    let user = existing;
    if (user) {
      user.name = name.trim();
      user.phone = phone || '';
      user.role = role;
      user.password = hashed;
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        phone: phone || '',
        role,
        password: hashed
      });
    }

    // Non-blocking welcome email
    setImmediate(async () => {
      try {
        const { sendEmail } = require('../utils/email');
        await sendEmail(
          user.email,
          'Welcome to Farmer Market Connect!',
          `<p>Your account has been successfully created. You can now log in and access your dashboard.</p>`,
          'Your account has been successfully created. You can now log in and access your dashboard.'
        );
      } catch {}
    });

    return res.json({ ok: true, message: 'Registration successful. Please login.', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('❌ Password register error:', err);
    return res.status(500).json({ ok: false, error: 'Registration failed' });
  }
};

// Password-based login
exports.passwordLogin = async (req, res) => {
  try {
    console.log('[AUTH] Password login attempt:', req.body?.email);
    
    const { email, password } = req.body || {};
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    console.log('[AUTH] Looking up user:', email);
    const user = await User.findOne({ email: String(email).toLowerCase() });
    
    if (!user) {
      console.log('[AUTH] User not found:', email);
      return res.status(401).json({ ok: false, error: 'Invalid credentials. Please check your email or register first.' });
    }
    
    if (!user.password) {
      console.log('[AUTH] User has no password set:', email);
      return res.status(401).json({ ok: false, error: 'No password set for this account. Please use OTP login or reset password.' });
    }

    console.log('[AUTH] Comparing passwords...');
    const bcrypt = require('bcrypt');
    const match = await bcrypt.compare(String(password), user.password);
    
    if (!match) {
      console.log('[AUTH] Password mismatch for:', email);
      return res.status(401).json({ ok: false, error: 'Invalid credentials. Please check your password.' });
    }

    console.log('[AUTH] Password matched, generating token...');
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const token = jwt.sign({ uid: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    
    user.lastLogin = new Date();
    await user.save();

    console.log('[AUTH] Login successful for:', email, 'Role:', user.role);
    return res.json({ 
      ok: true, 
      message: 'Login successful', 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone 
      } 
    });
  } catch (err) {
    console.error('❌ Password login error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      ok: false, 
      error: 'Login failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Check if user exists
exports.checkUserExists = async (req, res) => {
  try {
    const { email } = req.body || {};
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.json({ 
      ok: true, 
      exists: !!user,
      user: user ? {
        email: user.email,
        name: user.name,
        role: user.role
      } : null
    });
  } catch (err) {
    console.error('❌ Check user exists error:', err);
    res.status(500).json({ ok: false, error: 'Failed to check user' });
  }
};

// Send OTP for login
exports.sendOtp = async (req, res) => {
  try {
    const { email, role = 'customer', name = 'User' } = req.body || {};
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    const code = generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);

    // Store OTP in database
    try {
      await Otp.deleteMany({ email: email.toLowerCase() });
      const otpRecord = new Otp({
        email: email.toLowerCase(),
        code: hashedCode,
        role,
        name,
        expiresAt: new Date(Date.now() + (OTP_TTL_SECONDS * 1000))
      });
      await otpRecord.save();
      console.log(`💾 OTP stored in database for ${email}`);
    } catch (dbError) {
      console.log(`⚠️ Database error, using memory fallback:`, dbError.message);
      // Fallback to in-memory storage
      otpStore.set(email.toLowerCase(), {
        code: hashedCode,
        expiresAt: Date.now() + (OTP_TTL_SECONDS * 1000),
        role,
        name
      });
      console.log(`💾 OTP stored in memory for ${email}`);
    }

    // Send OTP email
    await sendEmail(
      email,
      '🔐 Your FarmConnect OTP Code',
      buildOtpEmailHtml(code),
      `Your FarmConnect OTP is ${code}. It expires in ${Math.floor(OTP_TTL_SECONDS / 60)} minutes.`
    );

    res.json({ 
      ok: true, 
      message: `OTP sent to ${email}`,
      expiresIn: OTP_TTL_SECONDS
    });
  } catch (err) {
    console.error('❌ Send OTP error:', err);
    res.status(500).json({ ok: false, error: String(err?.message || 'Failed to send OTP') });
  }
};

// Verify OTP and login
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    
    if (!email || !code) {
      return res.status(400).json({ ok: false, error: 'Missing email or code' });
    }

    // Validate code format (must be 6 digits)
    const codeStr = String(code).trim();
    if (!/^\d{6}$/.test(codeStr)) {
      console.log(`❌ Invalid code format for ${email}: "${codeStr}" (length: ${codeStr.length})`);
      return res.status(400).json({ ok: false, error: 'Code must be exactly 6 digits' });
    }

    console.log(`🔍 Verifying OTP for ${email}, code: ${codeStr}`);
    let otpData = null;

    // Try database first
    try {
      const otpRecord = await Otp.findOne({ 
        email: email.toLowerCase()
      }).sort({ createdAt: -1 });
      
      if (otpRecord && otpRecord.expiresAt > new Date()) {
        const isMatch = await bcrypt.compare(codeStr, otpRecord.code);
        if (isMatch) {
          otpData = {
            code: otpRecord.code,
            role: otpRecord.role,
            name: otpRecord.name,
            expiresAt: otpRecord.expiresAt.getTime()
          };
          await Otp.deleteOne({ _id: otpRecord._id });
          console.log(`✅ OTP matched in database for ${email}`);
        }
      }
    } catch (dbError) {
      console.log(`⚠️ Database error:`, dbError.message);
    }

    // If not found in database, try memory fallback
    if (!otpData) {
      const mem = otpStore.get(email.toLowerCase());
      if (mem && mem.expiresAt > Date.now()) {
        const isMatch = await bcrypt.compare(codeStr, mem.code);
        if (isMatch) {
          otpData = mem;
          otpStore.delete(email.toLowerCase());
          console.log(`✅ OTP matched in memory for ${email}`);
        }
      }
    }

    if (!otpData) {
      console.log(`❌ Invalid or expired OTP for ${email}`);
      return res.status(400).json({ ok: false, error: 'Invalid or expired OTP' });
    }

    // Get user (must exist for login)
    let userData = await User.findOne({ email: email.toLowerCase() });
    
    if (!userData) {
      console.log(`❌ No account found for ${email}`);
      return res.status(404).json({ 
        ok: false, 
        error: 'Account not found. Please sign up first.' 
      });
    }
    
    console.log(`👤 User logged in: ${email}`);
    
    // Create JWT token
    const token = jwt.sign({ 
      uid: userData._id,
      role: userData.role,
      email: email 
    }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      ok: true, 
      token, 
      user: {
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone
      }
    });
  } catch (err) {
    console.error('❌ Verify OTP error:', err);
    res.status(500).json({ ok: false, error: String(err?.message || 'Failed to verify OTP') });
  }
};

// Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !String(email).includes('@')) {
      return res.status(400).json({ ok: false, error: 'Valid email required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      // Do not reveal whether user exists
      return res.json({ ok: true, message: 'If an account exists, a reset email has been sent' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrlBase = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
    const link = `${resetUrlBase}/reset-password/${token}`;

    const { sendEmail } = require('../utils/email');
    await sendEmail(
      user.email,
      'Password Reset - Farmer Market Connect',
      `<p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${link}">${link}</a></p>`,
      `Reset your password using this link (valid 30 mins): ${link}`
    );

    return res.json({ ok: true, message: 'If an account exists, a reset email has been sent' });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to initiate password reset' });
  }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({ ok: false, error: 'Token and new password are required' });
    }

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ ok: false, error: 'Invalid or expired token' });
    }

    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(String(password), 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ ok: true, message: 'Password reset successfully. Please login.' });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to reset password' });
  }
};

// Get current user from token
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).select('-__v');
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    res.json({ 
      ok: true, 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('❌ Get current user error:', err);
    res.status(500).json({ ok: false, error: 'Failed to get user' });
  }
};
