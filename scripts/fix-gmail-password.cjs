/**
 * Gmail Password Fix Script
 * This script will help you set the correct Gmail App Password
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Gmail App Password Fix Script');
console.log('================================\n');

console.log('📧 Current Gmail Configuration:');
console.log('Email: durga.ishu123@gmail.com');
console.log('Current Password: ezvatuedpwapolcx (NOT WORKING)\n');

console.log('🔑 To fix this, you need to:');
console.log('1. Go to: https://myaccount.google.com/apppasswords');
console.log('2. Sign in with: durga.ishu123@gmail.com');
console.log('3. Select "Mail" and generate App Password');
console.log('4. Copy the 16-character password (like: abcd efgh ijkl mnop)');
console.log('5. Remove spaces and use it below\n');

// Read current server file
const serverPath = path.join(__dirname, 'server', 'index.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

console.log('📝 Current line 26 in server/index.js:');
const lines = serverContent.split('\n');
console.log(lines[25] + '\n');

console.log('⚠️  IMPORTANT:');
console.log('- The password "ezvatuedpwapolcx" is NOT a real Gmail App Password');
console.log('- You MUST generate a real App Password from Gmail');
console.log('- Gmail App Passwords are 16 characters long');
console.log('- Remove spaces when using them in code\n');

console.log('🔄 After you get your real App Password:');
console.log('1. Edit server/index.js line 26');
console.log('2. Replace "ezvatuedpwapolcx" with your real password');
console.log('3. Restart the server: cd server && node index.js');
console.log('4. Test: node test-complete-system.cjs\n');

console.log('✅ Once fixed, OTP emails will be sent to your inbox in real-time!');
