// Quick check - what emails are registered?
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('\n📊 Checking registered users...\n');
    
    const users = await User.find({}).select('email role createdAt');
    
    if (users.length === 0) {
      console.log('✅ Database is empty - no users registered');
      console.log('   You can use any email for signup!\n');
    } else {
      console.log(`Found ${users.length} registered user(s):\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.email} (${user.role}) - ${user.createdAt.toLocaleString()}`);
      });
      console.log('\n⚠️  These emails are already taken.');
      console.log('   Use a different email for signup!\n');
      console.log('💡 Or run: node clear-test-users.js\n');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkUsers();
