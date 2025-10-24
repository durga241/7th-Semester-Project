require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUserRole() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // List all users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users:\n`);
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. Email: ${u.email}`);
      console.log(`   Name: ${u.name}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   ID: ${u._id}`);
      console.log('');
    });
    
    // Update specific user to farmer
    const emailToUpdate = 'abc@gmail.com'; // Change this to your email
    
    console.log(`\n🔄 Updating ${emailToUpdate} to farmer role...`);
    
    const user = await User.findOne({ email: emailToUpdate });
    
    if (!user) {
      console.log(`❌ User ${emailToUpdate} not found!`);
      console.log('\n💡 Available users:');
      users.forEach(u => console.log(`   - ${u.email}`));
      return;
    }
    
    console.log(`\n📝 Current user details:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Current Role: ${user.role}`);
    
    if (user.role === 'farmer') {
      console.log('\n✅ User is already a farmer!');
    } else {
      user.role = 'farmer';
      await user.save();
      console.log(`\n✅ User role updated from "${user.role}" to "farmer"`);
    }
    
    console.log('\n🎉 Done! Now:');
    console.log('1. Clear browser session (localStorage.clear())');
    console.log('2. Login again');
    console.log('3. Try adding product');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🔧 Update User Role to Farmer\n');
updateUserRole();
