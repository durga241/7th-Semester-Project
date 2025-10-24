require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function testAddProduct() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' });
    
    if (!farmer) {
      console.log('❌ No farmer found in database!');
      console.log('Creating a test farmer...');
      
      const testFarmer = await User.create({
        email: 'testfarmer@test.com',
        name: 'Test Farmer',
        role: 'farmer',
        phone: '1234567890',
        password: 'hashedpassword'
      });
      
      console.log('✅ Test farmer created:', testFarmer._id);
      
      // Use this farmer
      await addTestProduct(testFarmer._id);
    } else {
      console.log('✅ Found farmer:', farmer.name, '(', farmer.email, ')');
      await addTestProduct(farmer._id);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

async function addTestProduct(farmerId) {
  console.log('\n📦 Creating test product...');
  
  const testProduct = await Product.create({
    title: 'Test Tomato',
    description: 'Fresh organic tomatoes for testing',
    price: 39,
    quantity: 100,
    category: 'Vegetables',
    farmerId: farmerId,
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
  console.log('📊 Total products in database:', totalProducts);
  
  // List all products
  const allProducts = await Product.find({}).populate('farmerId', 'name email');
  console.log('\n📦 All products in database:');
  allProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title} - ₹${p.price} (${p.category}) by ${p.farmerId?.name || 'Unknown'}`);
  });
}

console.log('🧪 Testing Product Creation...\n');
testAddProduct();
