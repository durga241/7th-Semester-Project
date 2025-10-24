const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmconnect';
    
    // MongoDB connection options with proper SSL/TLS settings
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    };

    // Add SSL/TLS options for MongoDB Atlas
    if (mongoURI.includes('mongodb+srv://') || mongoURI.includes('mongodb.net')) {
      options.tls = true;
      options.tlsAllowInvalidCertificates = false;
      options.tlsAllowInvalidHostnames = false;
    }
    
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️ Using fallback mode - data will be stored in memory');
    console.log('📝 App will work with in-memory storage (data lost on restart)');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = { connectDB };
