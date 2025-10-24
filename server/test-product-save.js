require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function testProductSave() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📝 MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('📦 Collections:', await mongoose.connection.db.listCollections().toArray());
    
    // Check if there are any users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('⚠️ No users found. Creating a test user...');
      const testUser = await User.create({
        email: 'testfarmer@test.com',
        name: 'Test Farmer',
        role: 'farmer',
        phone: '1234567890'
      });
      console.log('✅ Test user created:', testUser._id);
    }
    
    const farmer = users[0] || await User.findOne({ role: 'farmer' });
    
    if (!farmer) {
      console.log('❌ No farmer found!');
      return;
    }
    
    console.log(`\n🧑‍🌾 Using farmer: ${farmer.name} (${farmer._id})`);
    
    // Check existing products
    const existingProducts = await Product.find({});
    console.log(`\n📦 Existing products: ${existingProducts.length}`);
    
    // Create a test product
    console.log('\n🆕 Creating test product...');
    const testProduct = await Product.create({
      title: 'Test Tomato',
      description: 'Fresh organic tomatoes',
      price: 39,
      quantity: 100,
      category: 'Vegetables',
      farmerId: farmer._id,
      imageUrl: 'https://example.com/tomato.jpg',
      status: 'available',
      visibility: 'visible'
    });
    
    console.log('✅ Test product created successfully!');
    console.log('📝 Product ID:', testProduct._id);
    console.log('📝 Product Title:', testProduct.title);
    console.log('📝 Product Price:', testProduct.price);
    console.log('📝 Farmer ID:', testProduct.farmerId);
    
    // Verify it was saved
    const savedProduct = await Product.findById(testProduct._id);
    console.log('\n✅ Product verified in database:', savedProduct ? 'YES' : 'NO');
    
    // Count total products
    const totalProducts = await Product.countDocuments();
    console.log(`\n📊 Total products in database: ${totalProducts}`);
    
    // List all products
    const allProducts = await Product.find({}).populate('farmerId', 'name email');
    console.log('\n📦 All products:');
    allProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} - ₹${p.price} (${p.category}) by ${p.farmerId?.name || 'Unknown'}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

testProductSave();
