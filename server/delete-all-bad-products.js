require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function deleteAllBadProducts() {
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
      console.log('✅ Database is already empty!');
      console.log('\n📝 Next steps:');
      console.log('1. Refresh your browser (F5)');
      console.log('2. Products should disappear from customer view');
      console.log('3. Add new products from farmer dashboard');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PRODUCTS TO BE DELETED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   Price: ₹${p.price}/kg`);
      console.log(`   Stock: ${p.quantity} kg`);
      console.log(`   Image: ${p.imageUrl || 'No image'}`);
      console.log(`   Farmer: ${p.farmerId?.name || 'Unknown'}`);
      
      // Check if title is an image URL
      if (p.title && (p.title.includes('http://') || p.title.includes('/uploads/'))) {
        console.log(`   ⚠️  CORRUPTED: Title is an image URL`);
      }
      
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🗑️  DELETING ALL PRODUCTS...\n');
    
    // Delete all products
    const result = await Product.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} products!\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('WHAT HAPPENS NOW');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('✅ Products deleted from MongoDB database');
    console.log('✅ Products will disappear from:');
    console.log('   - Farmer Dashboard (My Products)');
    console.log('   - Customer Home Page');
    console.log('   - All product listings');
    console.log('   - Top Selling Product widget');
    console.log('   - Search results');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Refresh browser (F5) on both farmer and customer pages');
    console.log('2. Verify products are gone');
    console.log('3. Login as farmer');
    console.log('4. Add new products with correct data');
    console.log('5. Upload image files (not URLs)');
    console.log('6. Products will display correctly everywhere!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🗑️  DELETE ALL BAD PRODUCTS FROM DATABASE\n');
console.log('This will:');
console.log('1. Delete all products from MongoDB');
console.log('2. Remove from farmer dashboard');
console.log('3. Remove from customer view');
console.log('4. Clean everything\n');

deleteAllBadProducts();
