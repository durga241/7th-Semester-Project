/**
 * Database Setup Script
 * This script helps you set up MongoDB connection for FarmConnect
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ Database Setup for FarmConnect');
console.log('===================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env file...\n');
  
  const envContent = `# FarmConnect Environment Configuration

# MongoDB Configuration - Using MongoDB Atlas (Cloud)
# Replace this with your own Atlas connection string
MONGODB_URI=mongodb+srv://farmconnect:test123@cluster0.mongodb.net/farmconnect?retryWrites=true&w=majority

# MongoDB Connection Settings
MONGO_TIMEOUT_MS=10000

# JWT Secret
JWT_SECRET=dev-secret-change-me-in-production

# OTP Settings
OTP_TTL_SECONDS=300

# Gmail SMTP Configuration
SMTP_USER=durga.ishu123@gmail.com
SMTP_PASS=ezvatuedpwapolcx
SMTP_FROM=durga.ishu123@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Twilio Configuration (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Server Configuration
PORT=3001`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
  } catch (error) {
    console.log('❌ Failed to create .env file:', error.message);
    console.log('\n📝 Please create server/.env file manually with the following content:\n');
    console.log(envContent);
  }
}

console.log('\n🚀 Next Steps:\n');

console.log('Option 1: Use MongoDB Atlas (Recommended)');
console.log('1. Go to: https://www.mongodb.com/atlas');
console.log('2. Create free account and cluster');
console.log('3. Get connection string');
console.log('4. Update MONGODB_URI in server/.env');
console.log('5. Run: cd server && node index.js\n');

console.log('Option 2: Use Local MongoDB');
console.log('1. Download: https://www.mongodb.com/try/download/community');
console.log('2. Install and start MongoDB service');
console.log('3. Update MONGODB_URI in server/.env to: mongodb://127.0.0.1:27017/farmconnect');
console.log('4. Run: cd server && node index.js\n');

console.log('Option 3: Use Test Database (Limited)');
console.log('1. Keep current MONGODB_URI in server/.env');
console.log('2. Run: cd server && node index.js');
console.log('3. App will work with in-memory storage\n');

console.log('🧪 Test your setup:');
console.log('node test-complete-farmer-app.cjs\n');

console.log('📖 For detailed Atlas setup:');
console.log('node get-atlas-connection.cjs');
