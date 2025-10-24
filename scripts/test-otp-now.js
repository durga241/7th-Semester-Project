// Test OTP sending right now
import fetch from 'node-fetch';

async function testOTPNow() {
  console.log('🧪 Testing OTP Email Right Now');
  console.log('==============================\n');

  try {
    // Test Gmail configuration
    console.log('1. Checking Gmail configuration...');
    const gmailResponse = await fetch('http://localhost:3001/api/health/gmail');
    const gmailData = await gmailResponse.json();
    
    if (gmailData.ok) {
      console.log('✅ Gmail SMTP configured correctly');
      console.log(`   User: ${gmailData.user}`);
    } else {
      console.log('❌ Gmail configuration issue:');
      console.log(`   Error: ${gmailData.error}`);
      if (gmailData.instructions) {
        console.log('\n📧 Setup Instructions:');
        gmailData.instructions.forEach(instruction => {
          console.log(`   ${instruction}`);
        });
      }
      return;
    }

    // Send OTP to your email
    console.log('\n2. Sending OTP to durga.ishu123@gmail.com...');
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
      console.log('\n🎯 Check your email inbox for the OTP!');
      console.log('   Look for email from: durga.ishu123@gmail.com');
      console.log('   Subject: Your FarmConnect OTP Code');
    } else {
      console.log('❌ OTP email failed:');
      console.log(`   Error: ${otpData.error}`);
      console.log(`   Hint: ${otpData.hint || 'Check Gmail configuration'}`);
      
      if (otpData.error && otpData.error.includes('App Password')) {
        console.log('\n🔑 Gmail App Password Setup:');
        console.log('1. Go to: https://myaccount.google.com/apppasswords');
        console.log('2. Select "Mail" and generate password');
        console.log('3. Copy the 16-character password');
        console.log('4. Update server/index.js line 25:');
        console.log('   SMTP_PASS = "your-actual-16-character-password"');
        console.log('5. Restart server: cd server && node index.js');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('   cd server && node index.js');
  }
}

testOTPNow();
