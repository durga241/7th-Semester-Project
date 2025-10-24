require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function clearAllProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Count existing products
    const count = await Product.countDocuments();
    console.log(`\n📦 Found ${count} products in database`);
    
    if (count === 0) {
      console.log('✅ Database is already empty!');
      return;
    }
    
    // List all products before deleting
    const products = await Product.find({});
    console.log('\n🗑️  Products to be deleted:');
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} - ₹${p.price}`);
    });
    
    // Delete all products
    console.log('\n🗑️  Deleting all products...');
    const result = await Product.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products`);
    
    // Verify
    const remainingCount = await Product.countDocuments();
    console.log(`\n📊 Products remaining: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('✅ All products cleared successfully!');
      console.log('\n🎉 Database is now clean!');
      console.log('Now you can add products through the farmer dashboard.');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🗑️  Clearing All Products from MongoDB...\n');
clearAllProducts();
