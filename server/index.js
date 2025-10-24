/* SMTP OTP + API server using Express + Nodemailer + MongoDB + Cloudinary */
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Load environment variables from server directory FIRST
dotenv.config({ path: path.resolve(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Otp = require('./models/Otp');
const stripeController = require('./controllers/stripeController');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;
const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 300);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// In-memory storage (for testing without database)
const otpStore = new Map();
const productStore = new Map();

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmconnect', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.log('⚠️ MongoDB connection failed, using fallback mode:', err.message);
    console.log('📝 App will work with in-memory storage (data lost on restart)');
  });

// Cloudinary config with alias support
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('📸 Cloudinary Configuration:');
console.log('  Cloud Name:', CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ NOT SET');
console.log('  API Key:', CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  API Secret:', CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');

if (CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️ Cloudinary not configured - image uploads will fail');
}

const upload = multer({ storage: multer.memoryStorage() });

// OTP utils
const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  // Fallback to Gmail service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendOtpEmail(toEmail, htmlBody, textBody) {
  try {
    const transporter = createTransport();
    
    // Verify connection first
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: '🔐 Your FarmConnect OTP Code',
      html: htmlBody,
      text: textBody,
      headers: {
        'X-Mailer': 'FarmConnect-OTP-System'
      }
    });
    
    console.log(`✅ Email sent successfully to ${toEmail}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

function buildEmailHtml(code) {
  const minutes = Math.floor(OTP_TTL_SECONDS / 60) || 5;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a;">🌾 FarmConnect</h2>
      <h3>Your One-Time Password (OTP)</h3>
      <div style="background: #f0f9ff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #16a34a; border: 2px dashed #16a34a;">
        ${code}
      </div>
      <p>This OTP is valid for ${minutes} minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
}

// Health endpoints
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'smtp-otp+api', now: new Date().toISOString() });
});

app.get('/api/health/db', (_req, res) => {
  const states = ['disconnected','connected','connecting','disconnecting'];
  res.json({ ok: mongoose.connection.readyState === 1, state: states[mongoose.connection.readyState] });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, error: 'Missing email' });
    
    const code = generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const htmlBody = buildEmailHtml(code);
    const textBody = `Your FarmConnect OTP is ${code}. It expires in 5 minutes.`;
    
    const result = await sendOtpEmail(to, htmlBody, textBody);
    
    res.json({ 
      ok: true, 
      messageId: result.messageId, 
      code: code,
      message: `Test email sent to ${to}`
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Gmail health check endpoint
app.get('/api/health/gmail', async (_req, res) => {
  try {
    const { SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    
    if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      return res.status(400).json({
        ok: false,
        error: 'Gmail configuration missing',
        required: ['SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'],
        instructions: [
          '1. Set SMTP_USER to your Gmail address',
          '2. Set SMTP_PASS to your 16-character App Password',
          '3. Set SMTP_FROM to your Gmail address',
          '4. Enable 2-Step Verification in Gmail',
          '5. Generate App Password from: https://myaccount.google.com/apppasswords'
        ]
      });
    }
    
    // Test Gmail connection
    const transporter = createTransport();
    const verified = await transporter.verify();
    
    if (verified) {
      res.json({
        ok: true,
        message: 'Gmail SMTP configured and working',
        user: SMTP_USER,
        from: SMTP_FROM
      });
    } else {
      throw new Error('Gmail connection verification failed');
    }
    
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e?.message || 'Gmail configuration failed',
      hint: 'Check your Gmail App Password and 2-Step Verification'
    });
  }
});

// Auth - send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, role = 'customer', name = 'User' } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    const code = generateOtpCode();

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
      console.log(`[OTP] 💾 OTP stored in database for ${email}: ${code}`);
    } catch (dbError) {
      console.log(`[OTP] 🗄️ Database error, using memory fallback:`, dbError.message);
      // Fallback to in-memory storage
      otpStore.set(email.toLowerCase(), {
        code: hashedCode,
        expiresAt: Date.now() + (OTP_TTL_SECONDS * 1000),
        role,
        name
      });
      console.log(`[OTP] 💾 OTP stored in memory for ${email}: ${code}`);
    }

    // Send email
    const sendRes = await sendOtpEmail(
      email,
      buildEmailHtml(code),
      `Your FarmConnect OTP is ${code}. It expires in ${Math.floor(OTP_TTL_SECONDS / 60)} minutes.`
    );

    res.json({ 
      ok: true, 
      message: `OTP sent to ${email}`,
      messageId: sendRes?.messageId,
      expiresIn: OTP_TTL_SECONDS
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || 'Failed to send OTP') });
  }
});

// Auth - verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ ok: false, error: 'Missing email or code' });

    console.log(`[VERIFY] 🔍 Verifying OTP for ${email} with code ${code}`);
    let otpData = null;

    // Try database first
    try {
      const otpRecord = await Otp.findOne({ 
        email: email.toLowerCase()
      }).sort({ createdAt: -1 });
      
      console.log(`[VERIFY] 📊 Database OTP record:`, otpRecord ? 'Found' : 'Not found');
      
      if (otpRecord && otpRecord.expiresAt > new Date()) {
        const isMatch = await bcrypt.compare(String(code), otpRecord.code);
        if (isMatch) {
          otpData = {
            code: otpRecord.code,
            role: otpRecord.role,
            name: otpRecord.name,
            expiresAt: otpRecord.expiresAt.getTime()
          };
          await Otp.deleteOne({ _id: otpRecord._id });
          console.log(`[VERIFY] ✅ OTP matched in database for ${email}`);
        } else {
          console.log(`[VERIFY] ❌ OTP mismatch for ${email}`);
        }
      } else if (otpRecord) {
        console.log(`[VERIFY] ⏰ OTP expired for ${email}`);
      }
    } catch (dbError) {
      console.log(`[VERIFY] 🗄️ Database error, trying memory fallback:`, dbError.message);
      // Fallback to memory
      const mem = otpStore.get(email.toLowerCase());
      if (mem && mem.expiresAt > Date.now()) {
        const isMatch = await bcrypt.compare(String(code), mem.code);
        if (isMatch) {
          otpData = mem;
          otpStore.delete(email.toLowerCase());
          console.log(`[VERIFY] ✅ OTP matched in memory for ${email}`);
        } else {
          otpData = null;
          console.log(`[VERIFY] ❌ OTP mismatch in memory for ${email}`);
        }
      } else {
        otpData = null;
        console.log(`[VERIFY] ❌ No valid OTP in memory for ${email}`);
      }
    }

    if (!otpData) {
      console.log(`[VERIFY] ❌ No valid OTP found for ${email}`);
      return res.status(400).json({ ok: false, error: 'Invalid or expired OTP' });
    }

    // Get user (must exist; do not auto-create on login verification)
    let userData = null;
    try {
      userData = await User.findOne({ email: email.toLowerCase() });
      
      if (!userData) {
        console.log(`[VERIFY] ❌ No account for ${email}. Require signup first.`);
        return res.status(404).json({ ok: false, error: 'Account not found. Please sign up.' });
      } else {
        console.log(`[VERIFY] 👤 Existing user found: ${email}`);
      }
    } catch (dbError) {
      console.log(`[VERIFY] 🗄️ Database error, creating user in memory:`, dbError.message);
      // Create user object in memory if database fails with proper ObjectId
      const mongoose = require('mongoose');
      return res.status(500).json({ ok: false, error: 'Database unavailable. Please try again.' });
    }
    
    // Create JWT token
    const token = jwt.sign({ 
      uid: userData._id,
      role: userData.role,
      email: email 
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      ok: true, 
      token, 
      user: {
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || 'Failed to verify OTP') });
  }
});

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

// User registration
app.post('/api/auth/register', async (req, res) => {
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
        error: 'User already exists'
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

    // Auto-login: create JWT
    const token = jwt.sign({ 
      uid: newUser._id,
      role: newUser.role,
      email: newUser.email
    }, JWT_SECRET, { expiresIn: '30d' });

    // Best-effort signup email (non-blocking)
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
          <h2 style="color:#16a34a;">Welcome to FarmConnect</h2>
          <p>Hi ${newUser.name},</p>
          <p>Your account has been created successfully as a <strong>${newUser.role}</strong>.</p>
          <p>You can now start ${newUser.role === 'farmer' ? 'adding products and managing orders' : 'browsing fresh products and placing orders'}.</p>
          <p style="color:#64748b; font-size:12px;">This is a notification email. No action required.</p>
        </div>`;
      await sendOtpEmail(newUser.email, html, `Welcome to FarmConnect, ${newUser.name}!`);
    } catch (e) {
      console.log('Signup email send failed:', e?.message);
    }

    res.json({
      ok: true,
      message: 'User registered successfully',
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
    res.status(500).json({ ok: false, error: String(err?.message || 'Registration failed') });
  }
});

// User signup with password
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name, password, role = 'customer', phone } = req.body || {};
    
    if (!email || !name || !password) {
      return res.status(400).json({ ok: false, error: 'Email, name, and password are required' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        ok: false, 
        error: 'Email already registered'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: role,
      phone: phone || ''
    });
    
    await newUser.save();

    // Create JWT
    const token = jwt.sign({ 
      uid: newUser._id,
      role: newUser.role,
      email: newUser.email
    }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      ok: true,
      message: 'Account created successfully',
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
    console.error('[SIGNUP] Error:', err);
    res.status(500).json({ ok: false, error: String(err?.message || 'Signup failed') });
  }
});

// User login with password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    
    // Check if user has a password (might be OTP-only user)
    if (!user.password) {
      return res.status(401).json({ ok: false, error: 'Please use OTP login or reset your password' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    
    // Create JWT
    const token = jwt.sign({ 
      uid: user._id,
      role: user.role,
      email: user.email
    }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      ok: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
    
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    res.status(500).json({ ok: false, error: String(err?.message || 'Login failed') });
  }
});

// Products
app.post('/api/products', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ ok: false, error: 'Forbidden' });

    let user = null;
    try {
      user = await User.findById(req.user.uid);
      if (!user) {
        console.log(`[PRODUCT] User not found, creating new user for ${req.user.email}`);
        user = await User.create({
          email: req.user.email,
          name: req.user.email.split('@')[0],
          role: req.user.role,
          phone: ''
        });
      }
    } catch (dbError) {
      console.log(`[PRODUCT] Database error, using fallback user:`, dbError.message);
      // Create user object in memory if database fails
      const mongoose = require('mongoose');
      user = {
        _id: new mongoose.Types.ObjectId(),
        email: req.user.email,
        name: req.user.email.split('@')[0],
        role: req.user.role,
        phone: ''
      };
    }

    let imageUrl = '';
    
    // Handle image upload to Cloudinary
    if (req.file && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        console.log('[PRODUCT] Uploading image to Cloudinary...');
        console.log('[PRODUCT] Reading fresh credentials from process.env');
        
        // Read credentials directly from process.env (not cached constants)
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        
        console.log('[PRODUCT] Credentials check:');
        console.log('  - Cloud Name:', cloudName);
        console.log('  - API Key:', apiKey);
        console.log('  - API Secret:', apiSecret ? '***' + apiSecret.slice(-4) : 'NOT SET');
        
        // Reconfigure cloudinary with fresh credentials from env
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true
        });
        
        const base64String = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${base64String}`;
        
        // Simple upload without any optional parameters
        const uploadResult = await cloudinary.uploader.upload(dataUri);
        
        imageUrl = uploadResult.secure_url;
        console.log('[PRODUCT] ✅ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('[PRODUCT] ❌ Cloudinary upload failed:', uploadError.message);
        console.error('[PRODUCT] Error details:', uploadError);
        // Continue without image if upload fails
      }
    } else if (req.file) {
      console.log('[PRODUCT] ⚠️ Cloudinary not configured, skipping image upload');
    }
    
    // Fallback: accept direct URL if provided
    if (!imageUrl && req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    let product = null;
    try {
      product = await Product.create({
        title: req.body.title,
        description: req.body.description || '',
        price: Number(req.body.price),
        quantity: Number(req.body.quantity),
        category: req.body.category,
        farmerId: user._id,
        imageUrl,
        status: req.body.status || 'available',
        visibility: req.body.visibility || 'visible'
      });
      console.log(`[PRODUCT] ✅ Product created successfully: ${product.title}`);
    } catch (dbError) {
      console.log(`[PRODUCT] Database error, creating product in memory:`, dbError.message);
      // Create product object in memory if database fails
      const mongoose = require('mongoose');
      product = {
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        description: req.body.description || '',
        price: Number(req.body.price),
        quantity: Number(req.body.quantity),
        category: req.body.category,
        farmerId: user._id,
        imageUrl,
        status: req.body.status || 'available',
        visibility: req.body.visibility || 'visible',
        createdAt: new Date()
      };
      // Store in memory
      productStore.set(product._id.toString(), product);
      console.log(`[PRODUCT] 💾 Product stored in memory: ${product.title}`);
    }
    
    res.json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to create product: ' + err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    let products = [];
    let total = 0;
    
    if (mongoose.connection.readyState === 1) {
      // Database is connected, use database
      const { page = 1, limit = 12, category } = req.query;
      const q = { visibility: 'visible' }; // Only show visible products
      if (category) q.category = category;
      products = await Product.find(q)
        .populate('farmerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      total = await Product.countDocuments(q);
    } else {
      // Database not connected, use memory storage
      console.log(`[PRODUCTS] Database not connected, using memory storage`);
      const { category } = req.query;
      const allProducts = Array.from(productStore.values());
      
      let filteredProducts = allProducts.filter(p => p.visibility === 'visible'); // Only show visible products
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      // Sort by creation date (newest first)
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      total = filteredProducts.length;
      products = filteredProducts;
      
      console.log(`[PRODUCTS] Found ${total} products in memory`);
    }
    
    res.json({ ok: true, products, total });
  } catch (err) {
    console.error('[PRODUCTS] Error:', err.message);
    res.json({ ok: true, products: [], total: 0 });
  }
});

app.get('/api/products/farmer/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ ok: true, products: [] });
    }
    
    const items = await Product.find({ farmerId: req.params.id })
      .populate('farmerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ ok: true, products: items });
  } catch (err) {
    res.json({ ok: true, products: [] });
  }
});

app.put('/api/products/:id', auth, upload.single('image'), async (req, res) => {
  try {
    let product = null;
    
    if (mongoose.connection.readyState === 1) {
      // Database connected
      product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });

      // Handle image upload if provided
      if (req.file && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          console.log('[PRODUCT] Uploading new image to Cloudinary...');
          
          // Read credentials directly from process.env (not cached constants)
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
          const apiKey = process.env.CLOUDINARY_API_KEY;
          const apiSecret = process.env.CLOUDINARY_API_SECRET;
          
          // Reconfigure cloudinary with fresh credentials
          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
          });
          
          const base64String = req.file.buffer.toString('base64');
          const dataUri = `data:${req.file.mimetype};base64,${base64String}`;
          
          // Simple upload without any optional parameters
          const uploadResult = await cloudinary.uploader.upload(dataUri);
          
          product.imageUrl = uploadResult.secure_url;
          console.log('[PRODUCT] ✅ New image uploaded to Cloudinary:', uploadResult.secure_url);
        } catch (uploadError) {
          console.error('[PRODUCT] ❌ Cloudinary upload failed:', uploadError.message);
        }
      }

      ['title','description','price','quantity','category','imageUrl','status','visibility'].forEach((k) => {
        if (req.body[k] !== undefined) product[k] = req.body[k];
      });
      await product.save();
      console.log(`[PRODUCT] ✅ Product updated in database: ${product.title}`);
    } else {
      // Database not connected, update in memory
      product = productStore.get(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });

      ['title','description','price','quantity','category','imageUrl','status','visibility'].forEach((k) => {
        if (req.body[k] !== undefined) product[k] = req.body[k];
      });
      productStore.set(req.params.id, product);
      console.log(`[PRODUCT] ✅ Product updated in memory: ${product.title}`);
    }
    
    res.json({ ok: true, product });
  } catch (err) {
    console.error('[PRODUCT] Update error:', err.message);
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
});

app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Database connected
      const p = await Product.findById(req.params.id);
      if (!p) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(p.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });
      await p.deleteOne();
      console.log(`[PRODUCT] ✅ Product deleted from database: ${p.title}`);
    } else {
      // Database not connected, delete from memory
      const product = productStore.get(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });
      productStore.delete(req.params.id);
      console.log(`[PRODUCT] ✅ Product deleted from memory: ${product.title}`);
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('[PRODUCT] Delete error:', err.message);
    res.status(500).json({ ok: false, error: 'Delete failed' });
  }
});

// Toggle product status (available/out_of_stock)
app.patch('/api/products/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['available', 'out_of_stock'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }

    let product = null;
    
    if (mongoose.connection.readyState === 1) {
      product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });
      
      product.status = status;
      await product.save();
      console.log(`[PRODUCT] ✅ Product status updated in database: ${product.title} -> ${status}`);
    } else {
      product = productStore.get(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });
      
      product.status = status;
      productStore.set(req.params.id, product);
      console.log(`[PRODUCT] ✅ Product status updated in memory: ${product.title} -> ${status}`);
    }
    
    res.json({ ok: true, product });
  } catch (err) {
    console.error('[PRODUCT] Status update error:', err.message);
    res.status(500).json({ ok: false, error: 'Status update failed' });
  }
});

// Toggle product visibility (visible/hidden)
app.patch('/api/products/:id/visibility', auth, async (req, res) => {
  try {
    const { visibility } = req.body;
    if (!visibility || !['visible', 'hidden'].includes(visibility)) {
      return res.status(400).json({ ok: false, error: 'Invalid visibility' });
    }

    let product = null;
    
    if (mongoose.connection.readyState === 1) {
      product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });
      
      product.visibility = visibility;
      await product.save();
      console.log(`[PRODUCT] ✅ Product visibility updated in database: ${product.title} -> ${visibility}`);
    } else {
      product = productStore.get(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
      if (String(product.farmerId) !== req.user.uid) return res.status(403).json({ ok: false, error: 'Forbidden' });
      
      product.visibility = visibility;
      productStore.set(req.params.id, product);
      console.log(`[PRODUCT] ✅ Product visibility updated in memory: ${product.title} -> ${visibility}`);
    }
    
    res.json({ ok: true, product });
  } catch (err) {
    console.error('[PRODUCT] Visibility update error:', err.message);
    res.status(500).json({ ok: false, error: 'Visibility update failed' });
  }
});

// Razorpay configuration
const razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

// Create Razorpay order
app.post('/api/orders/create-payment', auth, async (req, res) => {
  try {
    const { items = [], shippingAddress } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'No items' });
    }

    let total = 0;
    let farmerId = null;
    
    // Calculate total and get farmer ID
    for (const it of items) {
      let product = null;
      if (mongoose.connection.readyState === 1) {
        product = await Product.findById(it.productId);
      } else {
        product = productStore.get(it.productId);
      }
      
      if (!product) return res.status(400).json({ ok: false, error: 'Invalid product' });
      total += product.price * Number(it.quantity);
      farmerId = product.farmerId;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: total * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`
    });

    // Create order in database
    let order = null;
    try {
      order = await Order.create({
        customerId: req.user.uid,
        farmerId: farmerId,
        products: items.map((it) => ({ 
          productId: it.productId, 
          quantity: Number(it.quantity), 
          price: Number(it.price || 0) 
        })),
        total,
        paymentInfo: {
          method: 'razorpay',
          razorpayOrderId: razorpayOrder.id,
          paymentStatus: 'pending'
        },
        shippingAddress: shippingAddress
      });
    } catch (dbError) {
      console.log('Database error, creating order in memory:', dbError.message);
      // Create order in memory if database fails
      const mongoose = require('mongoose');
      order = {
        _id: new mongoose.Types.ObjectId(),
        customerId: req.user.uid,
        farmerId: farmerId,
        products: items.map((it) => ({ 
          productId: it.productId, 
          quantity: Number(it.quantity), 
          price: Number(it.price || 0) 
        })),
        total,
        paymentInfo: {
          method: 'razorpay',
          razorpayOrderId: razorpayOrder.id,
          paymentStatus: 'pending'
        },
        shippingAddress: shippingAddress,
        status: 'pending',
        createdAt: new Date()
      };
    }

    res.json({ 
      ok: true, 
      order,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'
      }
    });
  } catch (err) {
    console.error('Payment creation error:', err.message);
    res.status(500).json({ ok: false, error: 'Payment creation failed' });
  }
});

// Verify Razorpay payment
app.post('/api/orders/verify-payment', auth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ ok: false, error: 'Missing payment details' });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ ok: false, error: 'Invalid signature' });
    }

    // Update order payment status
    let order = null;
    try {
      order = await Order.findOneAndUpdate(
        { 'paymentInfo.razorpayOrderId': razorpayOrderId },
        {
          'paymentInfo.paymentStatus': 'completed',
          'paymentInfo.razorpayPaymentId': razorpayPaymentId,
          'paymentInfo.razorpaySignature': razorpaySignature,
          status: 'confirmed'
        },
        { new: true }
      );
    } catch (dbError) {
      console.log('Database error updating payment:', dbError.message);
      // In memory mode, we can't easily update, but payment is verified
      order = { _id: 'memory_order', status: 'confirmed' };
    }

    res.json({ 
      ok: true, 
      message: 'Payment verified successfully',
      order 
    });
  } catch (err) {
    console.error('Payment verification error:', err.message);
    res.status(500).json({ ok: false, error: 'Payment verification failed' });
  }
});

// Get orders for farmer (Enhanced with full details)
app.get('/api/orders/farmer/:farmerId', auth, async (req, res) => {
  try {
    if (req.user.uid !== req.params.farmerId) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    let orders = [];
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find({ farmerId: req.params.farmerId })
        .populate('customerId', 'name email phone')
        .populate('products.productId', 'title imageUrl price')
        .sort({ createdAt: -1 });
      
      console.log(`[ORDERS] Found ${orders.length} orders for farmer ${req.params.farmerId}`);
    } else {
      // In memory mode, return empty orders for now
      console.log('[ORDERS] Database not connected, returning empty orders');
      orders = [];
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.error('Get farmer orders error:', err.message);
    res.json({ ok: true, orders: [] });
  }
});

// Get all orders (alternative endpoint)
app.get('/api/farmer/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    let orders = [];
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find({ farmerId: req.user.uid })
        .populate('customerId', 'name email phone')
        .populate('products.productId', 'title imageUrl price')
        .sort({ createdAt: -1 });
      
      console.log(`[ORDERS] Found ${orders.length} orders for farmer ${req.user.uid}`);
    } else {
      orders = [];
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.error('Get farmer orders error:', err.message);
    res.json({ ok: true, orders: [] });
  }
});

// Create order
app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items = [], address = {}, total = 0, paymentMethod = 'COD' } = req.body;
    
    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'No items in order' });
    }

    // Get farmerId from the first product
    let farmerId = null;
    const products = [];
    
    for (const item of items) {
      let product = null;
      if (mongoose.connection.readyState === 1) {
        product = await Product.findById(item.product?._id || item.product?.id || item.productId);
      } else {
        product = productStore.get(item.product?._id || item.product?.id || item.productId);
      }
      
      if (product) {
        if (!farmerId) farmerId = product.farmerId;
        products.push({
          productId: product._id,
          quantity: Number(item.quantity || 1),
          price: Number(item.product?.price || product.price || 0)
        });
      }
    }

    if (!farmerId) {
      return res.status(400).json({ ok: false, error: 'Could not determine farmer for order' });
    }

    // Map address to shippingAddress format
    const shippingAddress = {
      name: address.name || address.fullName || 'Customer',
      address: address.address || address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || address.zipCode || address.postalCode || '',
      phone: address.phone || address.mobile || ''
    };

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Incomplete shipping address. Please provide name, address, city, state, pincode, and phone.' 
      });
    }

    // Generate readable order ID
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    const readableOrderId = `ORD-${randomNum}`;
    
    const orderData = {
      orderId: readableOrderId, // Set orderId explicitly
      customerId: req.user.uid,
      farmerId: farmerId,
      products: products,
      total: Number(total),
      status: 'pending', // Always start with pending
      paymentInfo: {
        method: paymentMethod.toLowerCase() === 'cod' ? 'cod' : 'razorpay',
        paymentStatus: paymentMethod.toLowerCase() === 'cod' ? 'pending' : 'pending'
      },
      shippingAddress: shippingAddress
    };

    if (mongoose.connection.readyState === 1) {
      const order = await Order.create(orderData);
      console.log('[ORDER] ✅ Order saved to database');
      console.log('[ORDER] Order ID (orderId field):', order.orderId);
      console.log('[ORDER] Order ID (_id field):', order._id);
      console.log('[ORDER] Full order object:', JSON.stringify(order.toObject(), null, 2));
      
      // Use orderId if available, otherwise use _id
      const responseOrderId = order.orderId || order._id.toString();
      res.json({ ok: true, order, orderId: responseOrderId });
    } else {
      console.log('[ORDER] ⚠️ Database not connected, order saved locally');
      const randomNum = Math.floor(1000000 + Math.random() * 9000000);
      const localOrder = { ...orderData, orderId: `ORD-${randomNum}`, _id: `ORD${Date.now()}`, createdAt: new Date() };
      res.json({ ok: true, order: localOrder, orderId: localOrder.orderId });
    }
  } catch (error) {
    console.error('[ORDER] Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get all orders (for farmers)
app.get('/api/orders', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find()
        .populate('customerId', 'name email phone')
        .populate('farmerId', 'name email phone')
        .populate('products.productId', 'title imageUrl price category unit')
        .sort({ createdAt: -1 });
      
      console.log('[ORDERS] Fetched', orders.length, 'orders from database');
      
      // Log first order to see populate results
      if (orders.length > 0) {
        console.log('[ORDERS] Sample order customerId type:', typeof orders[0].customerId);
        console.log('[ORDERS] Sample order customerId:', JSON.stringify(orders[0].customerId));
        console.log('[ORDERS] Sample order products[0]:', orders[0].products[0]);
        console.log('[ORDERS] Sample order products[0].productId type:', typeof orders[0].products[0]?.productId);
        console.log('[ORDERS] Sample order products[0].productId:', JSON.stringify(orders[0].products[0]?.productId));
        console.log('[ORDERS] Is customerId populated?', orders[0].customerId && typeof orders[0].customerId === 'object' && orders[0].customerId.name);
      }
      
      // Transform orders to include proper field names for frontend
      const transformedOrders = orders.map(order => ({
        _id: order._id,
        id: order.orderId || order._id.toString(), // Use readable orderId
        orderId: order.orderId || order._id.toString(), // Use readable orderId
        customerId: order.customerId?._id || order.customerId,
        customerName: order.customerId?.name || 'Customer',
        farmerId: order.farmerId?._id || order.farmerId,
        products: order.products.map(p => ({
          productId: p.productId?._id || p.productId,
          product: {
            _id: p.productId?._id || p.productId,
            name: p.productId?.title || 'Product',
            title: p.productId?.title || 'Product',
            price: p.price,
            imageUrl: p.productId?.imageUrl || '',
          },
          quantity: p.quantity,
          price: p.price
        })),
        items: order.products.map(p => ({
          product: {
            _id: p.productId?._id || p.productId,
            name: p.productId?.title || 'Product',
            price: p.price,
            image: p.productId?.imageUrl || '',
          },
          quantity: p.quantity
        })),
        total: order.total,
        status: order.status,
        address: order.shippingAddress,
        shippingAddress: order.shippingAddress,
        paymentInfo: order.paymentInfo,
        feedback: order.feedback,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
      
      res.json({ ok: true, orders: transformedOrders });
    } else {
      console.log('[ORDERS] Database not connected');
      res.json({ ok: true, orders: [] });
    }
  } catch (error) {
    console.error('[ORDERS] Error:', error);
    res.json({ ok: true, orders: [] });
  }
});

// Update order status
app.patch('/api/orders/:orderId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (mongoose.connection.readyState === 1) {
      // Try to find by _id (MongoDB ObjectId)
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status: status },
        { new: true }
      ).populate('customerId', 'name email');

      if (order) {
        console.log(`[ORDER] Status updated: ${orderId} → ${status}`);
        
        // Send email notification to customer
        if (order.customerId && order.customerId.email) {
          try {
            // Create email transporter
            const transporter = createTransport();
            
            const statusMessages = {
              'confirmed': 'Your order has been confirmed and is being processed.',
              'packed': 'Your order has been packed and is ready for dispatch.',
              'dispatched': 'Your order has been dispatched from our facility.',
              'out for delivery': 'Your order is out for delivery and will reach you soon!',
              'delivered': 'Your order has been successfully delivered. Thank you for shopping with us!',
              'rejected': 'Unfortunately, your order has been rejected. Please contact support for more details.'
            };
            
            const statusMessage = statusMessages[status.toLowerCase()] || `Your order status has been updated to: ${status}`;
            const statusColor = status.toLowerCase() === 'delivered' ? '#10b981' : 
                               status.toLowerCase() === 'rejected' ? '#ef4444' : '#3b82f6';
            
            await transporter.sendMail({
              from: process.env.SMTP_FROM || 'noreply@farmconnect.com',
              to: order.customerId.email,
              subject: `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)} - ${order.orderId || orderId}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #10b981; margin: 0;">🌾 FarmConnect</h1>
                  </div>
                  
                  <div style="padding: 30px 20px;">
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Order Status Update</h2>
                    <p style="color: #6b7280; font-size: 14px;">Dear ${order.customerId.name || 'Customer'},</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; color: #374151;"><strong>Order ID:</strong> ${order.orderId || orderId}</p>
                      <p style="margin: 10px 0; color: #374151;"><strong>Status:</strong> 
                        <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                          ${status.toUpperCase()}
                        </span>
                      </p>
                      <p style="margin: 10px 0; color: #374151;"><strong>Total Amount:</strong> ₹${order.total}</p>
                    </div>
                    
                    <p style="color: #374151; line-height: 1.6;">${statusMessage}</p>
                    
                    ${status.toLowerCase() === 'delivered' ? `
                      <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #065f46;">
                          <strong>✅ Delivery Confirmed!</strong><br>
                          We hope you enjoy your fresh farm products. Please rate your experience!
                        </p>
                      </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        If you have any questions, please contact our support team.
                      </p>
                      <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                        Thank you for choosing FarmConnect! 🌱
                      </p>
                    </div>
                  </div>
                </div>
              `
            });
            console.log(`[EMAIL] ✅ Notification sent to ${order.customerId.email} for status: ${status}`);
          } catch (emailError) {
            console.error('[EMAIL] ❌ Failed to send notification:', emailError);
            console.error('[EMAIL] Error details:', {
              message: emailError.message,
              code: emailError.code,
              command: emailError.command
            });
          }
        } else {
          console.log('[EMAIL] ⚠️ No customer email found for order:', orderId);
        }

        res.json({ ok: true, order });
      } else {
        res.status(404).json({ ok: false, error: 'Order not found' });
      }
    } else {
      console.log('[ORDER] Database not connected');
      res.json({ ok: true, message: 'Status updated locally' });
    }
  } catch (error) {
    console.error('[ORDER] Error updating status:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Delete order
app.delete('/api/orders/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findByIdAndDelete(orderId);

      if (order) {
        console.log(`[ORDER] Deleted: ${orderId}`);
        res.json({ ok: true, message: 'Order deleted successfully' });
      } else {
        res.status(404).json({ ok: false, error: 'Order not found' });
      }
    } else {
      console.log('[ORDER] Database not connected');
      res.json({ ok: true, message: 'Order deleted locally' });
    }
  } catch (error) {
    console.error('[ORDER] Error deleting order:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/orders/:customerId', auth, async (req, res) => {
  try {
    if (req.user.uid !== req.params.customerId) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    
    const orders = await Order.find({ customerId: req.params.customerId })
      .populate('customerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .populate('products.productId', 'title imageUrl price category unit')
      .sort({ createdAt: -1 });
    
    // Transform orders to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order.orderId || order._id.toString(), // Use readable orderId
      orderId: order.orderId || order._id.toString(), // Use readable orderId
      _id: order._id.toString(), // MongoDB ObjectId for deletion
      customerId: order.customerId?._id || order.customerId,
      customerName: order.customerId?.name || 'Customer',
      items: order.products.map(p => ({
        product: {
          _id: p.productId?._id || p.productId,
          name: p.productId?.title || 'Product',
          price: p.price,
          image: p.productId?.imageUrl || '',
        },
        quantity: p.quantity
      })),
      total: order.total,
      address: order.shippingAddress,
      date: new Date(order.createdAt).toLocaleDateString(),
      status: order.status,
      paymentMethod: order.paymentInfo?.method === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      createdAt: order.createdAt
    }));
    
    res.json({ ok: true, orders: transformedOrders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Delete all orders (for testing) - No auth required
// NOTE: This must come BEFORE the parameterized route
app.delete('/api/orders/clear-all', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const result = await Order.deleteMany({});
      console.log(`[ORDERS] ✅ Deleted ${result.deletedCount} orders from database`);
      res.json({ ok: true, message: `Deleted ${result.deletedCount} orders`, count: result.deletedCount });
    } else {
      console.log('[ORDERS] ⚠️ Database not connected');
      res.json({ ok: false, message: 'Database not connected' });
    }
  } catch (error) {
    console.error('[ORDERS] ❌ Error deleting orders:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Delete individual order by ID
app.delete('/api/orders/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log(`[ORDER] 🗑️ Delete request received for: ${orderId}`);
    
    if (mongoose.connection.readyState === 1) {
      const result = await Order.findByIdAndDelete(orderId);
      
      if (result) {
        console.log(`[ORDER] ✅ Deleted order: ${orderId}`);
        res.json({ ok: true, message: 'Order deleted successfully' });
      } else {
        console.log(`[ORDER] ⚠️ Order not found: ${orderId}`);
        res.status(404).json({ ok: false, error: 'Order not found' });
      }
    } else {
      console.log('[ORDER] ⚠️ Database not connected');
      res.status(500).json({ ok: false, error: 'Database not connected' });
    }
  } catch (error) {
    console.error('[ORDER] ❌ Error deleting order:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
app.get('/api/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ status: 'active' });

    res.json({
      ok: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        activeUsers
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to load stats' });
  }
});

// User Management
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to load users' });
  }
});

app.post('/api/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      role,
      password: hashedPassword,
      status: 'active'
    });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const updateData = { name, email, phone, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to delete user' });
  }
});

app.patch('/api/admin/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update status' });
  }
});

// Product Management
app.get('/api/admin/products', auth, adminAuth, async (req, res) => {
  try {
    const products = await Product.find().populate('farmerId', 'name email').sort({ createdAt: -1 });
    res.json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to load products' });
  }
});

app.put('/api/admin/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', auth, adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to delete product' });
  }
});

app.patch('/api/admin/products/:id/visibility', auth, adminAuth, async (req, res) => {
  try {
    const { visibility } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { visibility }, { new: true });
    res.json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update visibility' });
  }
});

// Order Management
app.get('/api/admin/orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email')
      .populate('farmerId', 'name')
      .populate('products.productId', 'title imageUrl')
      .sort({ createdAt: -1 });
    res.json({ ok: true, orders });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to load orders' });
  }
});

app.patch('/api/admin/orders/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update order status' });
  }
});

// Analytics
app.get('/api/admin/analytics', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Mock data for charts (in production, calculate from real data)
    const analytics = {
      userGrowth: [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 52 },
        { month: 'Mar', count: 61 },
        { month: 'Apr', count: 70 },
        { month: 'May', count: 85 },
        { month: 'Jun', count: totalUsers }
      ],
      revenueData: [
        { month: 'Jan', revenue: 15000 },
        { month: 'Feb', revenue: 18000 },
        { month: 'Mar', revenue: 22000 },
        { month: 'Apr', revenue: 25000 },
        { month: 'May', revenue: 30000 },
        { month: 'Jun', revenue: totalRevenue }
      ],
      productPerformance: [
        { category: 'Vegetables', sales: 120 },
        { category: 'Fruits', sales: 95 },
        { category: 'Grains', sales: 75 },
        { category: 'Dairy', sales: 60 }
      ],
      orderVolume: [
        { status: 'Pending', count: 25 },
        { status: 'Confirmed', count: 45 },
        { status: 'Delivered', count: 80 }
      ],
      topProducts: [
        { name: 'Organic Tomatoes', sales: 45 },
        { name: 'Fresh Spinach', sales: 38 },
        { name: 'Sweet Mangoes', sales: 32 },
        { name: 'Farm Potatoes', sales: 28 },
        { name: 'Organic Carrots', sales: 25 }
      ],
      topFarmers: [
        { name: 'Ramesh Kumar', revenue: 45000 },
        { name: 'Priya Singh', revenue: 38000 },
        { name: 'Arjun Patel', revenue: 32000 },
        { name: 'Sita Devi', revenue: 28000 },
        { name: 'Mohan Lal', revenue: 25000 }
      ]
    };

    const kpis = {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      avgOrderValue,
      conversionRate: 3.5
    };

    res.json({ ok: true, analytics, kpis });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to load analytics' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Submit feedback for delivered order
app.post('/api/orders/:orderId/feedback', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, error: 'Rating must be between 1 and 5' });
    }
    
    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }
    
    // Check if order belongs to the user
    if (order.customerId.toString() !== req.user.uid) {
      return res.status(403).json({ ok: false, error: 'Not authorized' });
    }
    
    // Check if order is delivered
    if (order.status?.toLowerCase() !== 'delivered') {
      return res.status(400).json({ ok: false, error: 'Can only provide feedback for delivered orders' });
    }
    
    // Check if feedback already exists
    if (order.feedback && order.feedback.rating) {
      return res.status(400).json({ ok: false, error: 'Feedback already submitted for this order' });
    }
    
    // Add feedback
    order.feedback = {
      rating,
      comment: comment || '',
      createdAt: new Date()
    };
    
    await order.save();
    
    console.log(`[FEEDBACK] ✅ Feedback submitted for order: ${orderId}`);
    res.json({ ok: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('[FEEDBACK] Error submitting feedback:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get user profile
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    res.json({ 
      ok: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('[PROFILE] Error fetching profile:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Update user profile
app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email are required' });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.uid } });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'Email already in use' });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.uid,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    console.log(`[PROFILE] ✅ Profile updated for user: ${user.email}`);
    res.json({ ok: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('[PROFILE] Error updating profile:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Change password
app.put('/api/user/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ ok: false, error: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ ok: false, error: 'New password must be at least 6 characters' });
    }
    
    // Get user with password
    const user = await User.findById(req.user.uid);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return res.status(400).json({ ok: false, error: 'Cannot change password for OAuth users' });
    }
    
    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ ok: false, error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`[PROFILE] ✅ Password changed for user: ${user.email}`);
    res.json({ ok: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[PROFILE] Error changing password:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Global error handler
// ============================================
// STRIPE PAYMENT ROUTES
// ============================================

// Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', auth, stripeController.createCheckoutSession);

// Verify Stripe Payment
app.post('/api/stripe/verify-payment', auth, stripeController.verifyStripePayment);

// Handle Payment Cancellation
app.post('/api/stripe/cancel-payment', auth, stripeController.handlePaymentCancel);

// Stripe Webhook (no auth required, uses signature verification)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleStripeWebhook);

// ============================================
// ERROR HANDLERS
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    ok: false, 
    error: err.message || 'Internal server error' 
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({ 
    ok: false, 
    error: 'Route not found',
    path: req.path 
  });
});

app.listen(PORT, () => {
  console.log(`[api] server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});

// Optional: secure seed endpoint (requires SEED_TOKEN)
if (process.env.SEED_TOKEN) {
  app.post('/api/admin/seed/farmer', async (req, res) => {
    try {
      const token = (req.headers['x-seed-token'] || '').toString();
      if (token !== process.env.SEED_TOKEN) return res.status(403).json({ ok: false, error: 'Forbidden' });
      const { email, name } = req.body || {};
      if (!email) return res.status(400).json({ ok: false, error: 'email required' });
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) user = await User.create({ email: email.toLowerCase(), name: name || 'Seed Farmer', role: 'farmer' });
      return res.json({ ok: true, user });
    } catch (e) {
      console.error('seed farmer error:', e);
      return res.status(500).json({ ok: false, error: 'seed failed' });
    }
  });
}