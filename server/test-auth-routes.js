// Quick test script to verify auth routes are working
// Run with: node test-auth-routes.js

const http = require('http');

const API_URL = 'http://localhost:3001';

function testEndpoint(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
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

async function runTests() {
  console.log('🧪 Testing Authentication Routes\n');
  console.log('=' .repeat(50));

  // Test 1: Health Check
  console.log('\n1️⃣  Testing Health Check...');
  try {
    const result = await testEndpoint('GET', '/api/health');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(result.status === 200 ? '   ✅ PASS' : '   ❌ FAIL');
  } catch (err) {
    console.log('   ❌ FAIL:', err.message);
  }

  // Test 2: Farmer Check
  console.log('\n2️⃣  Testing /api/farmers/check...');
  try {
    const result = await testEndpoint('POST', '/api/farmers/check', {
      email: 'test@example.com'
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(result.status === 200 ? '   ✅ PASS' : '   ❌ FAIL');
  } catch (err) {
    console.log('   ❌ FAIL:', err.message);
  }

  // Test 3: Auth Check User
  console.log('\n3️⃣  Testing /api/auth/check-user...');
  try {
    const result = await testEndpoint('POST', '/api/auth/check-user', {
      email: 'test@example.com'
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(result.status === 200 ? '   ✅ PASS' : '   ❌ FAIL');
  } catch (err) {
    console.log('   ❌ FAIL:', err.message);
  }

  // Test 4: Send OTP
  console.log('\n4️⃣  Testing /api/auth/send-otp...');
  try {
    const result = await testEndpoint('POST', '/api/auth/send-otp', {
      email: 'test@example.com',
      role: 'farmer',
      name: 'Test User'
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, result.data);
    console.log(result.status === 200 ? '   ✅ PASS' : '   ❌ FAIL');
  } catch (err) {
    console.log('   ❌ FAIL:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Tests Complete!\n');
  console.log('If any tests failed, check:');
  console.log('  1. Server is running on port 3001');
  console.log('  2. MongoDB is connected');
  console.log('  3. Routes are properly defined');
  console.log('\nRun server with: node index.js\n');
}

// Check if server is running first
console.log('Checking if server is running...\n');
testEndpoint('GET', '/api/health')
  .then(() => {
    console.log('✅ Server is running!\n');
    runTests();
  })
  .catch((err) => {
    console.log('❌ Server is not running!');
    console.log('Error:', err.message);
    console.log('\nPlease start the server first:');
    console.log('  cd server');
    console.log('  node index.js\n');
    process.exit(1);
  });
