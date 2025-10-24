const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testSMTP() {
  console.log('Testing SMTP connection...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from FarmConnect',
      text: 'If you receive this, your SMTP is working correctly!',
      html: '<p>If you receive this, your <b>SMTP is working correctly!</b></p>',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox:', process.env.SMTP_USER);
    
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.response) console.error('Server Response:', error.response);
  }
}

testSMTP();
