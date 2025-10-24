// Clear test users from database
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function clearTestUsers() {
  console.log('🧹 Clearing test users from database...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Find all users
    const allUsers = await User.find({});
    console.log(`\nFound ${allUsers.length} total users:\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt}`);
    });
    
    // Delete test users (emails containing 'test' or 'example')
    const result = await User.deleteMany({
      email: { $regex: /(test|example)/i }
    });
    
    console.log(`\n✅ Deleted ${result.deletedCount} test user(s)`);
    
    // Show remaining users
    const remaining = await User.find({});
    console.log(`\n📊 Remaining users: ${remaining.length}`);
    
    if (remaining.length > 0) {
      console.log('\nRemaining users:');
      remaining.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role})`);
      });
    }
    
    console.log('\n✅ Done! You can now register with a fresh email.\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

clearTestUsers();
