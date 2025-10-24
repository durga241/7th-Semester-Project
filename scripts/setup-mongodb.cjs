/**
 * MongoDB Setup Helper
 * This script helps you set up MongoDB for the FarmConnect application
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔧 MongoDB Setup Helper for FarmConnect');
console.log('==========================================\n');

// Check if MongoDB is running
async function checkMongoDB() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health/db',
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data.ok);
        } catch {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function main() {
  console.log('🔍 Checking MongoDB status...');
  
  const isRunning = await checkMongoDB();
  
  if (isRunning) {
    console.log('✅ MongoDB is running and connected!');
    console.log('🎉 Your FarmConnect application is ready to use!');
    return;
  }
  
  console.log('❌ MongoDB is not running or not connected.');
  console.log('\n📋 Setup Options:\n');
  
  console.log('Option 1: Install MongoDB Community Server (Recommended)');
  console.log('1. Download from: https://www.mongodb.com/try/download/community');
  console.log('2. Install with default settings');
  console.log('3. Start MongoDB service: net start MongoDB');
  console.log('4. Restart your server: node index.js\n');
  
  console.log('Option 2: Use MongoDB Atlas (Cloud)');
  console.log('1. Go to: https://www.mongodb.com/atlas');
  console.log('2. Create free account and cluster');
  console.log('3. Get connection string');
  console.log('4. Update server/.env: MONGODB_URI=your-atlas-connection-string\n');
  
  console.log('Option 3: Use Docker (if installed)');
  console.log('1. Run: docker run -d -p 27017:27017 --name mongodb mongo:latest');
  console.log('2. Restart your server: node index.js\n');
  
  console.log('Option 4: Continue without MongoDB (Limited functionality)');
  console.log('1. The app will work with in-memory storage');
  console.log('2. Data will be lost when server restarts');
  console.log('3. Some features may not work properly\n');
  
  console.log('🚀 After setting up MongoDB, run: node test-complete-farmer-app.cjs');
}

main().catch(console.error);
