// Test OTP functionality
const fetch = require('node-fetch');

async function testOTP() {
  try {
    console.log('Testing OTP send...');
    
    const response = await fetch('http://localhost:3001/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        role: 'customer', 
        name: 'Test User' 
      }),
    });
    
    const data = await response.json();
    console.log('Send OTP response:', data);
    
    if (data.ok) {
      console.log('✅ OTP send successful');
      
      // Test verification
      console.log('Testing OTP verify...');
      const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          code: '123456' 
        }),
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Verify OTP response:', verifyData);
      
      if (verifyData.ok) {
        console.log('✅ OTP verify successful');
      } else {
        console.log('❌ OTP verify failed:', verifyData.error);
      }
    } else {
      console.log('❌ OTP send failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOTP();
