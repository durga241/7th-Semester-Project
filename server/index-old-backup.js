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

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Otp = require('./models/Otp');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
}

const upload = multer({ storage: multer.memoryStorage() });

// OTP utils
const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  // Clean password (remove any accidental whitespace)
  const cleanPass = pass ? pass.trim() : '';
  
  if (host && user && cleanPass) {
    console.log(`[SMTP] Using host: ${host}:${port} for ${user}`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { 
        user: user.trim(), 
        pass: cleanPass 
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });
  }
  
  // Fallback to Gmail service
  console.log(`[SMTP] Using Gmail service for ${user}`);
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { 
      user: user ? user.trim() : '', 
      pass: cleanPass 
    },
    tls: {
      rejectUnauthorized: false
    }
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

// Debug endpoint to check what server is reading
app.get('/api/debug/smtp', (req, res) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  res.json({
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
    passLength: SMTP_PASS ? SMTP_PASS.length : 0,
    passFirst4: SMTP_PASS ? SMTP_PASS.substring(0, 4) : 'NONE',
    passLast4: SMTP_PASS ? SMTP_PASS.substring(SMTP_PASS.length - 4) : 'NONE',
    hasQuotes: SMTP_PASS ? SMTP_PASS.includes('"') : false,
    hasSpaces: SMTP_PASS ? SMTP_PASS.includes(' ') : false,
    fullPass: SMTP_PASS // TEMPORARY - REMOVE AFTER DEBUG
  });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, error: 'Missing email' });
    
    const code = generateOtpCode();
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
    const { SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_HOST, SMTP_PORT } = process.env;
    
    if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      return res.status(400).json({
        ok: false,
        error: 'Gmail configuration missing',
        required: ['SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
      });
    }
    
    // Log configuration (hide password partially for security)
    console.log('\n🔍 SMTP Configuration Debug:');
    console.log(`   Host: ${SMTP_HOST}`);
    console.log(`   Port: ${SMTP_PORT}`);
    console.log(`   User: ${SMTP_USER}`);
    console.log(`   Pass: ${SMTP_PASS ? SMTP_PASS.substring(0, 4) + '****' + SMTP_PASS.substring(SMTP_PASS.length - 4) : 'NOT SET'}`);
    console.log(`   From: ${SMTP_FROM}\n`);
    
    // Test Gmail connection
    const transporter = createTransport();
    const verified = await transporter.verify();
    
    if (verified) {
      res.json({
        ok: true,
        message: 'Gmail SMTP configured and working',
        user: SMTP_USER,
        from: SMTP_FROM,
        config: {
          host: SMTP_HOST,
          port: SMTP_PORT,
          passLength: SMTP_PASS?.length || 0
        }
      });
    } else {
      throw new Error('Gmail connection verification failed');
    }
    
  } catch (e) {
    console.error('❌ Gmail verification error:', e.message);
    res.status(500).json({
      ok: false,
      error: e?.message || 'Gmail configuration failed',
      hint: 'Check your Gmail App Password and 2-Step Verification',
      user: process.env.SMTP_USER
    });
  }
});

// Auth - send OTP (FIXED: Added missing hashedCode definition + Console Fallback)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, role = 'customer', name = 'User' } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    const code = generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10); // FIX: Added missing hash

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

    // Try to send email, but don't fail if it doesn't work
    let emailSent = false;
    let sendRes = null;
    
    try {
      sendRes = await sendOtpEmail(
        email,
        buildEmailHtml(code),
        `Your FarmConnect OTP is ${code}. It expires in ${Math.floor(OTP_TTL_SECONDS / 60)} minutes.`
      );
      emailSent = true;
      console.log(`[OTP] ✅ Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`[OTP] ❌ Email failed (using console fallback):`, emailError.message);
      console.log('\n' + '='.repeat(60));
      console.log(`📧 OTP FOR ${email}: ${code}`);
      console.log(`   Valid for ${Math.floor(OTP_TTL_SECONDS / 60)} minutes`);
      console.log('='.repeat(60) + '\n');
      emailSent = false;
    }

    res.json({ 
      ok: true, 
      message: emailSent ? `OTP sent to ${email}` : `OTP generated (check server console)`,
      messageId: sendRes?.messageId,
      expiresIn: OTP_TTL_SECONDS,
      emailSent,
      devMode: !emailSent,
      otp: !emailSent ? code : undefined // Only send OTP in response if email failed (dev mode)
    });
  } catch (err) {
    console.error('[OTP] ❌ Complete failure:', err);
    res.status(500).json({ ok: false, error: String(err?.message || 'Failed to send OTP') });
  }
});
