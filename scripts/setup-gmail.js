// Gmail SMTP Setup Script
const fs = require('fs');
const path = require('path');

console.log('🔧 Gmail SMTP Setup for FarmConnect');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ Found existing .env file');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Server Configuration
PORT=3001
JWT_SECRET=farmconnect-jwt-secret-2024

# Gmail SMTP Configuration (REQUIRED for email OTP)
# Replace with your actual Gmail credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your@gmail.com

# MongoDB Configuration (Optional - for persistence)
MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect
MONGO_TIMEOUT_MS=10000

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file in server directory');
}

console.log('\n📧 Gmail Setup Instructions:');
console.log('============================');
console.log('1. Go to your Gmail account settings');
console.log('2. Enable 2-Step Verification');
console.log('3. Generate an App Password:');
console.log('   - Go to Google Account settings');
console.log('   - Security → 2-Step Verification → App passwords');
console.log('   - Generate a new app password for "Mail"');
console.log('   - Copy the 16-character password');
console.log('\n4. Edit server/.env file and replace:');
console.log('   SMTP_USER=your-actual@gmail.com');
console.log('   SMTP_PASS=your-16-character-app-password');
console.log('   SMTP_FROM=your-actual@gmail.com');
console.log('\n5. Restart the server: cd server && node index.js');
console.log('\n6. Test the configuration:');
console.log('   curl http://localhost:3001/api/health/gmail');
console.log('\n🎯 Once configured, OTP emails will be sent in real-time!');
