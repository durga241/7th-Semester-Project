/**
 * Update .env file with working MongoDB Atlas connection
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating .env file with MongoDB Atlas connection...\n');

const envPath = path.join(__dirname, 'server', '.env');

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Update MongoDB URI to use Atlas
const newMongoURI = 'MONGODB_URI=mongodb+srv://farmconnect:test123@cluster0.mongodb.net/farmconnect?retryWrites=true&w=majority';

// Replace the MongoDB URI line
envContent = envContent.replace(
  /MONGODB_URI=.*/,
  newMongoURI
);

// Also fix the SMTP password (remove spaces)
envContent = envContent.replace(
  /SMTP_PASS=.*/,
  'SMTP_PASS=ezvatuedpwapolcx'
);

// Write updated content
fs.writeFileSync(envPath, envContent);

console.log('✅ .env file updated successfully!');
console.log('✅ MongoDB URI updated to Atlas connection');
console.log('✅ SMTP password fixed (removed spaces)\n');

console.log('🚀 Now starting the server...\n');
