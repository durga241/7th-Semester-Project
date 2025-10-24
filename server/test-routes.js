// Quick test to verify routes are working
const http = require('http');

const testEndpoint = (path, method = 'POST', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          path: path
        });
      });
    });

    req.on('error', (error) => {
      reject({ path, error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testRoutes() {
  console.log('🧪 Testing Backend Routes...\n');

  const tests = [
    {
      name: 'Check Farmer Route',
      path: '/api/farmers/check',
      data: { email: 'test@example.com' }
    },
    {
      name: 'Register Farmer Route',
      path: '/api/farmers/register',
      data: { email: 'test@example.com', name: 'Test', phone: '1234567890' }
    },
    {
      name: 'Send OTP Route',
      path: '/api/auth/send-otp',
      data: { email: 'test@example.com', role: 'farmer', name: 'Test' }
    }
  ];

  for (const test of tests) {
    try {
      const result = await testEndpoint(test.path, 'POST', test.data);
      console.log(`✅ ${test.name}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Path: ${result.path}`);
      console.log(`   Response: ${result.body.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.error || error.message}`);
      console.log(`   Path: ${error.path}\n`);
    }
  }

  console.log('🏁 Test Complete!');
}

// Run tests
testRoutes().catch(console.error);
