/**
 * Setup Local MongoDB
 * This script helps you set up MongoDB locally on Windows
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️ Setup Local MongoDB');
console.log('======================\n');

console.log('🚀 Quick MongoDB Setup (5 minutes):\n');

console.log('1️⃣ Download MongoDB Community Server:');
console.log('   → Go to: https://www.mongodb.com/try/download/community');
console.log('   → Select: Windows x64');
console.log('   → Download and run the installer\n');

console.log('2️⃣ Install MongoDB:');
console.log('   → Run the installer as Administrator');
console.log('   → Choose "Complete" installation');
console.log('   → Check "Install MongoDB as a Service"');
console.log('   → Check "Install MongoDB Compass" (optional)\n');

console.log('3️⃣ Start MongoDB Service:');
console.log('   → Open Command Prompt as Administrator');
console.log('   → Run: net start MongoDB\n');

console.log('4️⃣ Test Connection:');
console.log('   → Run: cd server && node index.js');
console.log('   → Should show: [DB] ✅ MongoDB connected successfully!\n');

console.log('🎉 That\'s it! Your backend will be fully functional!\n');

console.log('💡 Alternative: Use MongoDB Atlas (Cloud)');
console.log('   → Go to: https://www.mongodb.com/atlas');
console.log('   → Create free account');
console.log('   → Create free cluster');
console.log('   → Get connection string\n');

console.log('🚀 Ready to start? Run: cd server && node index.js');

