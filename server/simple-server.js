const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

console.log('🚀 Starting Simple FarmConnect Server...\n');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  phone: String,
  password: String,
  role: { type: String, default: 'customer' }
}));

// Health Check
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'FarmConnect API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is working', routes: ['POST /api/auth/signup', 'POST /api/auth/login'] });
});

// Test endpoint to verify server is accessible
app.get('/api/auth/test', (req, res) => {
  console.log('✅ Test endpoint hit!');
  res.json({ ok: true, message: 'Auth routes are working!' });
});

// SIGNUP ROUTE
app.post('/api/auth/signup', async (req, res) => {
  console.log('📝 Signup request:', req.body?.email);
  
  try {
    const { name, email, password, phone, role } = req.body;
    
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ ok: false, error: 'Name, email and password are required' });
    }
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({ ok: false, error: 'User already exists. Please login.' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashed,
      role: role || 'customer'
    });
    
    console.log('✅ User created:', user.email, '(' + user.role + ')');
    
    return res.json({ 
      ok: true, 
      message: 'Registration successful. Please login.',
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    return res.status(500).json({ ok: false, error: 'Registration failed: ' + err.message });
  }
});

// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login request:', req.body?.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      console.log('❌ User not found or no password:', email);
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { uid: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '30d' }
    );
    
    console.log('✅ User logged in:', user.email);
    
    return res.json({
      ok: true,
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
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ ok: false, error: 'Login failed: ' + err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('✅ Simple Server Running!');
  console.log('========================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📝 Signup: POST /api/auth/signup`);
  console.log(`🔐 Login:  POST /api/auth/login`);
  console.log('========================================\n');
});
