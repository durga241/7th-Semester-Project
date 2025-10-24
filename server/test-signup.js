// Test signup endpoint directly
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

async function testSignup() {
  console.log('🧪 Testing Signup Process...\n');
  
  try {
    // Step 1: Test MongoDB connection
    console.log('Step 1: Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('ReadyState:', mongoose.connection.readyState, '(1 = connected)\n');
    
    // Step 2: Test user creation
    const testEmail = 'test-' + Date.now() + '@example.com';
    const testData = {
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      role: 'customer',
      phone: '1234567890'
    };
    
    console.log('Step 2: Testing user creation...');
    console.log('Test email:', testEmail);
    
    // Check if user exists
    const existing = await User.findOne({ email: testEmail.toLowerCase() });
    if (existing) {
      console.log('⚠️ Test user already exists (this shouldn\'t happen with timestamp)');
      await existing.deleteOne();
      console.log('✅ Deleted existing test user');
    }
    
    // Hash password
    const hashed = await bcrypt.hash(testData.password, 10);
    console.log('✅ Password hashed');
    
    // Create user
    const user = await User.create({
      name: testData.name.trim(),
      email: testData.email.toLowerCase(),
      phone: testData.phone || '',
      role: testData.role,
      password: hashed
    });
    
    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Name:', user.name);
    
    // Clean up
    console.log('\nStep 3: Cleaning up test data...');
    await user.deleteOne();
    console.log('✅ Test user deleted\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL TESTS PASSED!');
    console.log('Your signup endpoint should work correctly.');
    console.log('If signup still fails in the app, the issue is likely:');
    console.log('  1. Frontend sending incorrect data format');
    console.log('  2. CORS issues');
    console.log('  3. Server not restarted after code changes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (err) {
    console.error('\n❌❌❌ TEST FAILED ❌❌❌');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    
    if (err.name === 'MongooseError' || err.name === 'MongoServerError') {
      console.error('\n🔍 This is a MongoDB error!');
      
      if (err.message.includes('buffering timed out')) {
        console.error('Issue: Database connection timeout');
        console.error('Solutions:');
        console.error('  1. Check your internet connection');
        console.error('  2. Verify MongoDB Atlas cluster is running');
        console.error('  3. Check IP whitelist in MongoDB Atlas');
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
        console.error('Issue: Cannot reach MongoDB server');
        console.error('Solutions:');
        console.error('  1. Check MONGODB_URI in server/.env');
        console.error('  2. Verify internet connection');
        console.error('  3. Check MongoDB Atlas status');
      } else if (err.code === 11000) {
        console.error('Issue: Duplicate key error');
        console.error('Solutions:');
        console.error('  1. Email already exists in database');
        console.error('  2. Try with different email');
      }
    }
    
    console.error('\n📋 Full Error Stack:');
    console.error(err.stack);
    console.error('\n');
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

testSignup();
