// Gmail Configuration Script for Real-Time OTP
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Gmail SMTP Configuration for Real-Time OTP');
console.log('==============================================\n');

// Create .env file in server directory
const envPath = path.join(__dirname, 'server', '.env');
const envContent = `# Server Configuration
PORT=3001
JWT_SECRET=farmconnect-jwt-secret-2024

# Gmail SMTP Configuration (REQUIRED for email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=durga.ishu123@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=durga.ishu123@gmail.com

# MongoDB Configuration (Optional - for persistence)
MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect
MONGO_TIMEOUT_MS=10000

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret`;

fs.writeFileSync(envPath, envContent);
console.log('✅ Created server/.env file');

console.log('\n📧 Gmail Setup Instructions:');
console.log('============================');
console.log('1. Go to your Gmail account: durga.ishu123@gmail.com');
console.log('2. Enable 2-Step Verification:');
console.log('   - Go to Google Account settings');
console.log('   - Security → 2-Step Verification');
console.log('   - Turn on 2-Step Verification');
console.log('\n3. Generate App Password:');
console.log('   - In Google Account settings');
console.log('   - Security → 2-Step Verification → App passwords');
console.log('   - Select "Mail" and generate password');
console.log('   - Copy the 16-character password (e.g., abcd efgh ijkl mnop)');
console.log('\n4. Update server/.env file:');
console.log('   Replace: SMTP_PASS=your-16-character-app-password');
console.log('   With:    SMTP_PASS=your-actual-16-character-password');
console.log('\n5. Restart the server:');
console.log('   cd server && node index.js');
console.log('\n6. Test the configuration:');
console.log('   Visit: http://localhost:3001/api/health/gmail');
console.log('\n🎯 Once configured, OTP emails will be sent in real-time!');
console.log('\n⚠️  IMPORTANT: Use App Password, NOT your regular Gmail password!');
