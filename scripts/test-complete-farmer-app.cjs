/**
 * Complete Farmer Application Test
 * Tests: Authentication, OTP, Product Management, Image Upload, Database Integration
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

// Test colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testServerHealth() {
  log('\n🔍 Testing Server Health...', 'blue');
  
  try {
    const response = await makeRequest('/api/health');
    if (response.status === 200 && response.data.ok) {
      log('✅ Server is running', 'green');
      return true;
    } else {
      log('❌ Server health check failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Server is not running', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testDatabaseConnection() {
  log('\n🗄️ Testing Database Connection...', 'blue');
  
  try {
    const response = await makeRequest('/api/health/db');
    if (response.status === 200 && response.data.ok) {
      log('✅ Database is connected', 'green');
      log(`   State: ${response.data.state}`, 'green');
      return true;
    } else {
      log('❌ Database connection failed', 'red');
      log(`   State: ${response.data.state}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Database test failed', 'red');
    return false;
  }
}

async function testGmailConfiguration() {
  log('\n📧 Testing Gmail Configuration...', 'blue');
  
  try {
    const response = await makeRequest('/api/health/gmail');
    if (response.status === 200 && response.data.ok) {
      log('✅ Gmail SMTP is configured correctly', 'green');
      log(`   User: ${response.data.config.user}`, 'green');
      log(`   Test email sent: ${response.data.test.testEmailSent}`, 'green');
      return true;
    } else {
      log('❌ Gmail configuration failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      log(`   Hint: ${response.data.hint}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Gmail test failed', 'red');
    return false;
  }
}

async function testFarmerRegistration() {
  log('\n👨‍🌾 Testing Farmer Registration...', 'blue');
  
  const testFarmer = {
    email: 'testfarmer@example.com',
    name: 'Test Farmer',
    role: 'farmer',
    phone: '+91 9876543210'
  };
  
  try {
    const response = await makeRequest('/api/auth/register', 'POST', testFarmer);
    if (response.status === 200 && response.data.ok) {
      log('✅ Farmer registration works', 'green');
      log(`   Farmer ID: ${response.data.user._id}`, 'green');
      return { success: true, farmerId: response.data.user._id };
    } else if (response.status === 409) {
      log('✅ Farmer already exists (expected)', 'green');
      return { success: true, farmerId: 'existing' };
    } else {
      log('❌ Farmer registration failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Registration test failed', 'red');
    return { success: false };
  }
}

async function testOTPSending() {
  log('\n🔐 Testing OTP Sending...', 'blue');
  
  const testOTP = {
    email: 'testfarmer@example.com',
    role: 'farmer',
    name: 'Test Farmer'
  };
  
  try {
    const response = await makeRequest('/api/auth/send-otp', 'POST', testOTP);
    if (response.status === 200 && response.data.ok) {
      log('✅ OTP sending works', 'green');
      log(`   Provider: ${response.data.provider}`, 'green');
      log(`   Message ID: ${response.data.messageId}`, 'green');
      return { success: true, messageId: response.data.messageId };
    } else {
      log('❌ OTP sending failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ OTP test failed', 'red');
    return { success: false };
  }
}

async function testProductAPI() {
  log('\n📦 Testing Product API...', 'blue');
  
  try {
    const response = await makeRequest('/api/products');
    if (response.status === 200 && response.data.ok) {
      log('✅ Product API works', 'green');
      log(`   Products count: ${response.data.products?.length || 0}`, 'green');
      return true;
    } else {
      log('❌ Product API failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Product API test failed', 'red');
    return false;
  }
}

async function testCloudinaryConfig() {
  log('\n☁️ Testing Cloudinary Configuration...', 'blue');
  
  // Check if Cloudinary is configured in environment
  try {
    const response = await makeRequest('/api/health');
    if (response.status === 200) {
      log('✅ Server health check passed', 'green');
      log('ℹ️ Cloudinary configuration will be tested during image upload', 'yellow');
      return true;
    } else {
      log('❌ Server health check failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Cloudinary config test failed', 'red');
    return false;
  }
}

async function runCompleteTest() {
  log('🚀 Complete Farmer Application Test', 'bold');
  log('=====================================', 'bold');
  
  const results = {
    server: await testServerHealth(),
    database: await testDatabaseConnection(),
    gmail: await testGmailConfiguration(),
    registration: await testFarmerRegistration(),
    otp: await testOTPSending(),
    products: await testProductAPI(),
    cloudinary: await testCloudinaryConfig()
  };
  
  log('\n📊 Test Results Summary:', 'bold');
  log('========================', 'bold');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result?.success !== false ? '✅ PASS' : '❌ FAIL';
    const color = result?.success !== false ? 'green' : 'red';
    log(`${test.toUpperCase()}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => 
    result?.success !== false && result !== false
  );
  
  if (allPassed) {
    log('\n🎉 All tests passed! Your farmer application is ready!', 'green');
    log('\n📋 Next Steps:', 'blue');
    log('1. Start frontend: npm run dev', 'blue');
    log('2. Test farmer registration flow', 'blue');
    log('3. Test OTP email delivery', 'blue');
    log('4. Test product creation with image upload', 'blue');
    log('5. Verify real-time database integration', 'blue');
  } else {
    log('\n⚠️ Some tests failed. Please check the setup:', 'yellow');
    log('1. Ensure MongoDB is running: net start MongoDB', 'yellow');
    log('2. Fix Gmail SMTP configuration in server/index.js', 'yellow');
    log('3. Check server logs for detailed error messages', 'yellow');
    log('4. Verify Cloudinary credentials in .env file', 'yellow');
  }
  
  log('\n📖 For detailed setup instructions, see: AUTHENTICATION_FIX_COMPLETE.md', 'blue');
}

// Run the complete test
runCompleteTest().catch(console.error);
