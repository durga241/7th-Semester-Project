require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function deleteAllProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Get all products first
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} products:\n`);
    
    if (products.length === 0) {
      console.log('✅ Database is already empty!');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }
    
    // Show what will be deleted
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   Price: ₹${p.price}`);
      console.log(`   Image: ${p.imageUrl || 'No image'}`);
      console.log('');
    });
    
    // Delete all products
    console.log('🗑️  Deleting all products...\n');
    const result = await Product.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} products!`);
    console.log('\n📝 Next steps:');
    console.log('1. Make sure you are logged in as a FARMER');
    console.log('2. Go to farmer dashboard');
    console.log('3. Add products with correct data');
    console.log('4. Images will display correctly!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🗑️  DELETE ALL PRODUCTS\n');
console.log('⚠️  WARNING: This will delete ALL products from the database!\n');
deleteAllProducts();
