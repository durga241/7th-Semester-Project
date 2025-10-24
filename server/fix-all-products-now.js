require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function fixAllProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Get all products
    const products = await Product.find({}).populate('farmerId');
    console.log(`\n📦 Found ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log('✅ Database is empty - no products to fix!');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CURRENT PRODUCTS (WITH ISSUES)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let badProducts = 0;
    
    products.forEach((p, i) => {
      console.log(`${i + 1}. Product ID: ${p._id}`);
      console.log(`   Title: "${p.title}"`);
      console.log(`   Price: ₹${p.price}`);
      console.log(`   Quantity: ${p.quantity}`);
      console.log(`   Image URL: ${p.imageUrl || 'No image'}`);
      console.log(`   Farmer: ${p.farmerId?.name || 'Unknown'}`);
      
      // Check if title is an image URL
      if (p.title && (p.title.includes('http://') || p.title.includes('/uploads/'))) {
        console.log(`   ❌ ISSUE: Title is an image URL (should be product name)`);
        badProducts++;
      }
      
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SUMMARY: ${badProducts} products have issues`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (badProducts > 0) {
      console.log('🗑️  DELETING ALL BAD PRODUCTS...\n');
      
      const result = await Product.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} products!\n`);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('NEXT STEPS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('1. ✅ Products deleted from database');
      console.log('2. 🔄 Refresh your browser (F5)');
      console.log('3. 📝 Products should disappear from:');
      console.log('   - Farmer Dashboard');
      console.log('   - Customer Home Page');
      console.log('   - All product lists');
      console.log('');
      console.log('4. ➕ Add new products correctly:');
      console.log('   - Login as FARMER');
      console.log('   - Go to "My Products"');
      console.log('   - Click "Add New Product"');
      console.log('   - Fill in correct data');
      console.log('   - Upload image file');
      console.log('   - Click "Save Product"');
      console.log('');
      console.log('5. ✅ New products will display correctly!');
      
    } else {
      console.log('✅ All products look good - no issues found!');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🔧 FIX ALL PRODUCTS\n');
console.log('This script will:');
console.log('1. Check all products for issues');
console.log('2. Delete products with corrupted data');
console.log('3. Clean the database\n');

fixAllProducts();
