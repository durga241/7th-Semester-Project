/**
 * Setup Local MongoDB for FarmConnect
 * This script helps you install and configure MongoDB locally
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('💾 Setting up Local MongoDB for FarmConnect');
console.log('===========================================\n');

// Check if MongoDB is already running
function checkMongoDB() {
  return new Promise((resolve) => {
    exec('netstat -an | findstr 27017', (error, stdout) => {
      if (stdout.includes('127.0.0.1:27017') || stdout.includes('0.0.0.0:27017')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Check if MongoDB service exists
function checkMongoService() {
  return new Promise((resolve) => {
    exec('sc query MongoDB', (error, stdout) => {
      if (stdout.includes('SERVICE_NAME: MongoDB')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Start MongoDB service
function startMongoService() {
  return new Promise((resolve) => {
    console.log('🚀 Starting MongoDB service...');
    exec('net start MongoDB', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to start MongoDB service:', error.message);
        resolve(false);
      } else {
        console.log('✅ MongoDB service started successfully!');
        resolve(true);
      }
    });
  });
}

// Update .env file with local MongoDB URI
function updateEnvFile() {
  const envPath = path.join(__dirname, 'server', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update MongoDB URI to local
    envContent = envContent.replace(
      /MONGODB_URI=.*/,
      'MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect'
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with local MongoDB URI');
    return true;
  } catch (error) {
    console.log('❌ Failed to update .env file:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking MongoDB status...\n');
  
  // Check if MongoDB is running
  const isRunning = await checkMongoDB();
  if (isRunning) {
    console.log('✅ MongoDB is already running on port 27017!');
    console.log('🎉 Your backend is ready to connect!\n');
    return;
  }
  
  // Check if MongoDB service exists
  const serviceExists = await checkMongoService();
  if (serviceExists) {
    console.log('✅ MongoDB service found');
    const started = await startMongoService();
    if (started) {
      console.log('🎉 MongoDB is now running!');
      updateEnvFile();
      return;
    }
  }
  
  console.log('❌ MongoDB is not installed or not running');
  console.log('\n📋 Setup Options:\n');
  
  console.log('Option 1: Install MongoDB Community Server (Recommended)');
  console.log('1. Download from: https://www.mongodb.com/try/download/community');
  console.log('2. Install with default settings');
  console.log('3. Run this script again: node setup-mongodb-local.cjs');
  console.log('4. Start your server: cd server && node index.js\n');
  
  console.log('Option 2: Use MongoDB Atlas (Cloud)');
  console.log('1. Go to: https://www.mongodb.com/atlas');
  console.log('2. Create free account and cluster');
  console.log('3. Get connection string');
  console.log('4. Update server/.env with Atlas URI');
  console.log('5. Start your server: cd server && node index.js\n');
  
  console.log('Option 3: Use Docker (if installed)');
  console.log('1. Run: docker run -d -p 27017:27017 --name mongodb mongo:latest');
  console.log('2. Start your server: cd server && node index.js\n');
  
  console.log('🚀 After setting up MongoDB, run: node test-complete-farmer-app.cjs');
}

main().catch(console.error);
