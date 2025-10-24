// Test Real-Time OTP Email Delivery
import fetch from 'node-fetch';

async function testRealTimeOTP() {
  console.log('🧪 Testing Real-Time OTP Email Delivery');
  console.log('=====================================\n');

  try {
    // Test 1: Check server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Server is running:', healthData.ok);

    // Test 2: Check Gmail configuration
    console.log('\n2. Testing Gmail configuration...');
    const gmailResponse = await fetch('http://localhost:3001/api/health/gmail');
    const gmailData = await gmailResponse.json();
    
    if (gmailData.ok) {
      console.log('✅ Gmail SMTP configured correctly');
      console.log(`   User: ${gmailData.user}`);
      console.log(`   From: ${gmailData.from}`);
    } else {
      console.log('❌ Gmail configuration failed:');
      console.log(`   Error: ${gmailData.error}`);
      console.log('\n📧 Setup Instructions:');
      gmailData.instructions?.forEach(instruction => {
        console.log(`   ${instruction}`);
      });
      return;
    }

    // Test 3: Send real OTP email
    console.log('\n3. Testing OTP email delivery...');
    const otpResponse = await fetch('http://localhost:3001/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'durga.ishu123@gmail.com', 
        role: 'customer', 
        name: 'Test User' 
      }),
    });
    
    const otpData = await otpResponse.json();
    
    if (otpResponse.ok && otpData.ok) {
      console.log('✅ OTP email sent successfully!');
      console.log(`   Provider: ${otpData.provider}`);
      console.log(`   Message: ${otpData.message}`);
      if (otpData.messageId) {
        console.log(`   Message ID: ${otpData.messageId}`);
      }
      console.log('\n🎯 Check your email inbox for the OTP!');
    } else {
      console.log('❌ OTP email failed:');
      console.log(`   Error: ${otpData.error}`);
      console.log(`   Hint: ${otpData.hint || 'Check Gmail configuration'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('   cd server && node index.js');
  }
}

testRealTimeOTP();
