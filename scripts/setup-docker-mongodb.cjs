/**
 * Setup MongoDB using Docker
 * This script helps you run MongoDB using Docker (fastest setup)
 */

const { exec } = require('child_process');

console.log('🐳 Setting up MongoDB using Docker');
console.log('==================================\n');

// Check if Docker is installed
function checkDocker() {
  return new Promise((resolve) => {
    exec('docker --version', (error, stdout) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Check if MongoDB container is running
function checkMongoContainer() {
  return new Promise((resolve) => {
    exec('docker ps | findstr mongodb', (error, stdout) => {
      if (stdout.includes('mongodb')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Start MongoDB container
function startMongoContainer() {
  return new Promise((resolve) => {
    console.log('🚀 Starting MongoDB container...');
    exec('docker run -d -p 27017:27017 --name mongodb mongo:latest', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to start MongoDB container:', error.message);
        resolve(false);
      } else {
        console.log('✅ MongoDB container started successfully!');
        console.log('✅ MongoDB is now running on port 27017');
        resolve(true);
      }
    });
  });
}

// Update .env file with local MongoDB URI
function updateEnvFile() {
  const fs = require('fs');
  const path = require('path');
  
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
  console.log('🔍 Checking Docker installation...\n');
  
  // Check if Docker is installed
  const dockerInstalled = await checkDocker();
  if (!dockerInstalled) {
    console.log('❌ Docker is not installed');
    console.log('\n📋 Setup Options:\n');
    
    console.log('Option 1: Install Docker Desktop');
    console.log('1. Download from: https://www.docker.com/products/docker-desktop');
    console.log('2. Install Docker Desktop');
    console.log('3. Run this script again: node setup-docker-mongodb.cjs\n');
    
    console.log('Option 2: Install MongoDB Community Server');
    console.log('1. Download from: https://www.mongodb.com/try/download/community');
    console.log('2. Install with default settings');
    console.log('3. Run: net start MongoDB\n');
    
    console.log('Option 3: Use MongoDB Atlas (Cloud)');
    console.log('1. Go to: https://www.mongodb.com/atlas');
    console.log('2. Create free account and cluster');
    console.log('3. Get connection string');
    console.log('4. Update server/.env with Atlas URI\n');
    
    return;
  }
  
  console.log('✅ Docker is installed');
  
  // Check if MongoDB container is running
  const containerRunning = await checkMongoContainer();
  if (containerRunning) {
    console.log('✅ MongoDB container is already running!');
    console.log('🎉 Your backend is ready to connect!\n');
    updateEnvFile();
    return;
  }
  
  // Start MongoDB container
  const started = await startMongoContainer();
  if (started) {
    console.log('🎉 MongoDB is now running!');
    updateEnvFile();
    console.log('\n🚀 Now you can start your server:');
    console.log('cd server && node index.js\n');
  }
}

main().catch(console.error);
