/**
 * Install MongoDB Locally
 * This script helps you install MongoDB locally for immediate use
 */

console.log('💾 Install MongoDB Locally for FarmConnect');
console.log('==========================================\n');

console.log('📥 Download and Install MongoDB:\n');

console.log('1️⃣ Download MongoDB Community Server:');
console.log('   → Go to: https://www.mongodb.com/try/download/community');
console.log('   → Select "Windows"');
console.log('   → Click "Download" (about 200MB)\n');

console.log('2️⃣ Install MongoDB:');
console.log('   → Run the downloaded installer');
console.log('   → Choose "Complete" installation');
console.log('   → Install as a Windows Service');
console.log('   → Install MongoDB Compass (optional GUI)\n');

console.log('3️⃣ Start MongoDB Service:');
console.log('   → Open Command Prompt as Administrator');
console.log('   → Run: net start MongoDB');
console.log('   → Should show: "The MongoDB service is starting..."\n');

console.log('4️⃣ Update Your App:');
console.log('   → Open server/.env file');
console.log('   → Change MONGODB_URI to:');
console.log('     MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect\n');

console.log('5️⃣ Test Connection:');
console.log('   → Run: cd server && node index.js');
console.log('   → Should show: [DB] ✅ MongoDB connected successfully!\n');

console.log('🎉 That\'s it! Your backend will be fully functional!\n');

console.log('💡 Pro Tips:');
console.log('   • MongoDB will start automatically with Windows');
console.log('   • Data is stored in C:\\data\\db');
console.log('   • You can use MongoDB Compass to view your data');
console.log('   • No internet required for local development\n');

console.log('🚀 Ready to start? Run: cd server && node index.js');
