/**
 * Test Script for Signup API
 * Run this to verify the /api/auth/signup endpoint works
 * 
 * Usage: node test-signup-api.js
 */

const API_URL = 'http://localhost:3001/api/auth/signup';

const testData = {
  name: 'Test Farmer',
  email: `test${Date.now()}@example.com`, // Unique email
  phone: '1234567890',
  password: 'password123',
  role: 'farmer'
};

console.log('🧪 Testing Signup API...');
console.log('📍 URL:', API_URL);
console.log('📦 Data:', JSON.stringify(testData, null, 2));
console.log('');

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
  .then(async (response) => {
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    const contentType = response.headers.get('content-type');
    console.log('📊 Content-Type:', contentType);
    console.log('');
    
    if (response.status === 404) {
      console.log('❌ ERROR: 404 Not Found');
      console.log('   → The /api/auth/signup endpoint does not exist');
      console.log('   → Make sure the server is running: node index.js');
      console.log('   → Check that authRoutes is mounted in index.js');
      return;
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('❌ ERROR: Server returned HTML instead of JSON');
      console.log('   → The server might not be running properly');
      console.log('   → Check server logs for errors');
      const text = await response.text();
      console.log('   → Response:', text.substring(0, 200));
      return;
    }
    
    const data = await response.json();
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.ok) {
      console.log('✅ SUCCESS! Signup API is working correctly');
      console.log('✅ User created:', data.user?.email);
    } else {
      console.log('⚠️ API returned error:', data.error);
    }
  })
  .catch((error) => {
    console.log('❌ FETCH ERROR:', error.message);
    console.log('');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log('💡 Server is not running!');
      console.log('   → Start the server: cd server && node index.js');
      console.log('   → Make sure it\'s running on port 3001');
    } else {
      console.log('💡 Unknown error occurred');
      console.log('   → Check your internet connection');
      console.log('   → Verify the server URL is correct');
    }
  });
