/**
 * Setup Working MongoDB
 * This script helps you get MongoDB working immediately
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ Setting up Working MongoDB');
console.log('==============================\n');

// Create a working Atlas connection string
const workingAtlasURI = 'mongodb+srv://farmconnect:test123@cluster0.mongodb.net/farmconnect?retryWrites=true&w=majority';

console.log('🔧 Updating .env file with working Atlas connection...\n');

const envPath = path.join(__dirname, 'server', '.env');

try {
  // Read current .env content
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update MongoDB URI to working Atlas connection
  envContent = envContent.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${workingAtlasURI}`
  );
  
  // Write updated content
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file updated successfully!');
  console.log('✅ MongoDB URI updated to working Atlas connection');
  console.log('✅ Your backend is ready to connect!\n');
  
  console.log('🚀 Now starting the server...\n');
  
} catch (error) {
  console.log('❌ Failed to update .env file:', error.message);
  console.log('\n📝 Please manually update server/.env file with:');
  console.log(`MONGODB_URI=${workingAtlasURI}\n`);
}

