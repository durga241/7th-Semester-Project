/**
 * MongoDB Atlas Quick Setup Helper
 * This script helps you set up MongoDB Atlas for FarmConnect
 */

const fs = require('fs');
const path = require('path');

console.log('☁️ MongoDB Atlas Quick Setup for FarmConnect');
console.log('=============================================\n');

console.log('📋 Step-by-Step Atlas Setup:\n');

console.log('1️⃣ Create Atlas Account:');
console.log('   → Go to: https://www.mongodb.com/atlas');
console.log('   → Click "Try Free"');
console.log('   → Sign up with Google or Email\n');

console.log('2️⃣ Create Free Cluster:');
console.log('   → Choose "Free Shared" (M0)');
console.log('   → Select region closest to you');
console.log('   → Click "Create Cluster" (takes 1-2 minutes)\n');

console.log('3️⃣ Set Up Database Access:');
console.log('   → Go to "Database Access" in left menu');
console.log('   → Click "Add New Database User"');
console.log('   → Username: farmconnect');
console.log('   → Password: (generate secure password)');
console.log('   → Database User Privileges: "Read and write to any database"');
console.log('   → Click "Add User"\n');

console.log('4️⃣ Set Up Network Access:');
console.log('   → Go to "Network Access" in left menu');
console.log('   → Click "Add IP Address"');
console.log('   → Click "Allow Access from Anywhere" (0.0.0.0/0)');
console.log('   → Click "Confirm"\n');

console.log('5️⃣ Get Connection String:');
console.log('   → Go to "Clusters" in left menu');
console.log('   → Click "Connect" on your cluster');
console.log('   → Choose "Connect your application"');
console.log('   → Copy the connection string');
console.log('   → Replace <password> with your database password\n');

console.log('6️⃣ Update Your App:');
console.log('   → Open server/.env file');
console.log('   → Replace MONGODB_URI with your Atlas connection string');
console.log('   → Example: MONGODB_URI=mongodb+srv://farmconnect:yourpassword@cluster0.xxxxx.mongodb.net/farmconnect?retryWrites=true&w=majority\n');

console.log('7️⃣ Test Connection:');
console.log('   → Run: node test-complete-farmer-app.cjs');
console.log('   → Should show: ✅ DATABASE: PASS\n');

console.log('🎉 That\'s it! Your app will be fully functional!\n');

console.log('💡 Pro Tips:');
console.log('   • Keep your connection string secure');
console.log('   • Atlas free tier includes 512MB storage');
console.log('   • No credit card required for free tier');
console.log('   • Your data is automatically backed up\n');

console.log('🚀 Ready to start? Run: node test-complete-farmer-app.cjs');
