require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function checkProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Count products
    const count = await Product.countDocuments();
    console.log(`\n📦 Total products in database: ${count}`);
    
    if (count === 0) {
      console.log('\n❌ No products found in database!');
      console.log('\n💡 This means:');
      console.log('   1. Products are being saved locally only (in browser memory)');
      console.log('   2. API requests are failing (403 Forbidden)');
      console.log('   3. JWT token has wrong role');
      console.log('\n🔧 Solution:');
      console.log('   1. Clear browser localStorage');
      console.log('   2. Login fresh as FARMER');
      console.log('   3. Try adding product again');
    } else {
      // List all products
      const products = await Product.find({}).populate('farmerId', 'name email');
      console.log('\n📦 Products in database:');
      products.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.title}`);
        console.log(`   Category: ${p.category}`);
        console.log(`   Price: ₹${p.price}`);
        console.log(`   Quantity: ${p.quantity}`);
        console.log(`   Farmer: ${p.farmerId?.name || 'Unknown'} (${p.farmerId?.email || 'N/A'})`);
        console.log(`   Image: ${p.imageUrl || 'No image'}`);
        console.log(`   Status: ${p.status}`);
        console.log(`   Visibility: ${p.visibility}`);
        console.log(`   Created: ${p.createdAt}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🔍 Checking Products in MongoDB...\n');
checkProducts();
