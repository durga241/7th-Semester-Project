/**
 * Get Working MongoDB Connection
 * This script helps you get a working MongoDB connection immediately
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ Get Working MongoDB Connection');
console.log('==================================\n');

console.log('🚀 Quick MongoDB Setup (3 minutes):\n');

console.log('1️⃣ Create Atlas Account:');
console.log('   → Go to: https://www.mongodb.com/atlas');
console.log('   → Click "Try Free"');
console.log('   → Sign up with Google or Email');
console.log('   → No credit card required\n');

console.log('2️⃣ Create Free Cluster:');
console.log('   → Choose "Free Shared" (M0)');
console.log('   → Select region closest to you');
console.log('   → Click "Create Cluster" (1-2 minutes)\n');

console.log('3️⃣ Set Up Database User:');
console.log('   → Go to "Database Access"');
console.log('   → Click "Add New Database User"');
console.log('   → Username: farmconnect');
console.log('   → Password: (create strong password)');
console.log('   → Privileges: "Read and write to any database"');
console.log('   → Click "Add User"\n');

console.log('4️⃣ Set Up Network Access:');
console.log('   → Go to "Network Access"');
console.log('   → Click "Add IP Address"');
console.log('   → Click "Allow Access from Anywhere" (0.0.0.0/0)');
console.log('   → Click "Confirm"\n');

console.log('5️⃣ Get Connection String:');
console.log('   → Go to "Clusters"');
console.log('   → Click "Connect" on your cluster');
console.log('   → Choose "Connect your application"');
console.log('   → Copy the connection string');
console.log('   → Replace <password> with your database password\n');

console.log('6️⃣ Update Your App:');
console.log('   → Open server/.env file');
console.log('   → Replace MONGODB_URI with your Atlas connection string');
console.log('   → Example:');
console.log('     MONGODB_URI=mongodb+srv://farmconnect:yourpassword@cluster0.xxxxx.mongodb.net/farmconnect?retryWrites=true&w=majority\n');

console.log('7️⃣ Test Connection:');
console.log('   → Run: cd server && node index.js');
console.log('   → Should show: [DB] ✅ MongoDB connected successfully!\n');

console.log('🎉 That\'s it! Your backend will be fully functional!\n');

console.log('💡 Pro Tips:');
console.log('   • Keep your connection string secure');
console.log('   • Atlas free tier includes 512MB storage');
console.log('   • Your data is automatically backed up');
console.log('   • No local installation required\n');

console.log('🚀 Ready to start? Run: cd server && node index.js');

