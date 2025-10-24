/**
 * Complete System Test for FarmConnect
 * Tests MongoDB, Gmail SMTP, and OTP functionality
 */

const http = require('http');

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

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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

async function testUserRegistration() {
  log('\n👤 Testing User Registration...', 'blue');
  
  const testUser = {
    email: 'test@example.com',
    name: 'Test User',
    role: 'customer'
  };
  
  try {
    const response = await makeRequest('/api/auth/register', 'POST', testUser);
    if (response.status === 200 && response.data.ok) {
      log('✅ User registration works', 'green');
      return true;
    } else if (response.status === 409) {
      log('✅ User registration works (user already exists)', 'green');
      return true;
    } else {
      log('❌ User registration failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Registration test failed', 'red');
    return false;
  }
}

async function testOTPSending() {
  log('\n🔐 Testing OTP Sending...', 'blue');
  
  const testOTP = {
    email: 'test@example.com',
    role: 'customer',
    name: 'Test User'
  };
  
  try {
    const response = await makeRequest('/api/auth/send-otp', 'POST', testOTP);
    if (response.status === 200 && response.data.ok) {
      log('✅ OTP sending works', 'green');
      log(`   Provider: ${response.data.provider}`, 'green');
      log(`   Message ID: ${response.data.messageId}`, 'green');
      return true;
    } else {
      log('❌ OTP sending failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ OTP test failed', 'red');
    return false;
  }
}

async function runCompleteTest() {
  log('🚀 FarmConnect Complete System Test', 'bold');
  log('=====================================', 'bold');
  
  const results = {
    server: await testServerHealth(),
    database: await testDatabaseConnection(),
    gmail: await testGmailConfiguration(),
    registration: await testUserRegistration(),
    otp: await testOTPSending()
  };
  
  log('\n📊 Test Results Summary:', 'bold');
  log('========================', 'bold');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase()}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Your system is ready!', 'green');
    log('You can now:', 'green');
    log('1. Start the frontend: npm run dev', 'green');
    log('2. Test the complete application', 'green');
    log('3. Register farmers and customers', 'green');
    log('4. Send and verify OTPs in real-time', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please check the setup:', 'yellow');
    log('1. Ensure MongoDB is running', 'yellow');
    log('2. Fix Gmail SMTP configuration', 'yellow');
    log('3. Check server logs for details', 'yellow');
  }
  
  log('\n📖 For detailed setup instructions, see: COMPLETE_SETUP_GUIDE.md', 'blue');
}

// Run the complete test
runCompleteTest().catch(console.error);
