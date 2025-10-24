require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('\n🔧 Possible solutions:');
    console.error('1. Check your internet connection');
    console.error('2. Verify MongoDB Atlas cluster is running');
    console.error('3. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('4. Verify username/password are correct');
    process.exit(1);
  });
