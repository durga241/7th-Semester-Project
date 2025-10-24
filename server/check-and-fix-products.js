require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function checkAndFixProducts() {
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
      console.log('No products found. Database is empty.');
      console.log('\n💡 Next steps:');
      console.log('1. Make sure you are logged in as a FARMER (not customer)');
      console.log('2. Add a product from the farmer dashboard');
      console.log('3. Run this script again to verify');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }
    
    // Check each product
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Product #${i + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${p._id}`);
      console.log(`Title: "${p.title}"`);
      console.log(`Description: "${p.description}"`);
      console.log(`Price: ₹${p.price}`);
      console.log(`Quantity: ${p.quantity} kg`);
      console.log(`Category: ${p.category}`);
      console.log(`Image URL: ${p.imageUrl || 'No image'}`);
      console.log(`Farmer ID: ${p.farmerId?._id || 'No farmer'}`);
      console.log(`Farmer Name: ${p.farmerId?.name || 'Unknown'}`);
      console.log(`Farmer Email: ${p.farmerId?.email || 'Unknown'}`);
      
      // Detect issues
      const issues = [];
      
      // Issue 1: Title is an image URL
      if (p.title && (p.title.includes('http://') || p.title.includes('/uploads/'))) {
        issues.push('❌ Title is an image URL (should be product name)');
      }
      
      // Issue 2: ImageUrl is empty but title has URL
      if (!p.imageUrl && p.title && p.title.includes('/uploads/')) {
        issues.push('❌ Image URL is empty but title contains upload path');
      }
      
      // Issue 3: Price is 0 or invalid
      if (!p.price || p.price <= 0) {
        issues.push('❌ Price is invalid');
      }
      
      // Issue 4: Quantity is 0 or invalid
      if (!p.quantity || p.quantity <= 0) {
        issues.push('❌ Quantity is invalid');
      }
      
      if (issues.length > 0) {
        console.log(`\n⚠️  ISSUES DETECTED:`);
        issues.forEach(issue => console.log(`   ${issue}`));
        
        console.log(`\n🔧 RECOMMENDED FIX:`);
        console.log(`   Delete this product and add it again with correct data`);
        console.log(`   Command: node delete-product.js ${p._id}`);
      } else {
        console.log(`\n✅ Product data looks good!`);
      }
    }
    
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`SUMMARY`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total products: ${products.length}`);
    
    const badProducts = products.filter(p => 
      (p.title && (p.title.includes('http://') || p.title.includes('/uploads/'))) ||
      !p.price || p.price <= 0 ||
      !p.quantity || p.quantity <= 0
    );
    
    if (badProducts.length > 0) {
      console.log(`\n❌ Products with issues: ${badProducts.length}`);
      console.log(`\n💡 SOLUTION:`);
      console.log(`   Run: node clear-all-products.js`);
      console.log(`   Then add products again from farmer dashboard`);
    } else {
      console.log(`\n✅ All products look good!`);
    }
    
    // Check users
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`USER ACCOUNTS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const users = await User.find({});
    console.log(`\nTotal users: ${users.length}\n`);
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   Name: ${u.name}`);
      console.log(`   Role: ${u.role}`);
      if (u.role === 'customer') {
        console.log(`   ⚠️  This is a CUSTOMER account (cannot add products)`);
      } else if (u.role === 'farmer') {
        console.log(`   ✅ This is a FARMER account (can add products)`);
      }
      console.log('');
    });
    
    const farmers = users.filter(u => u.role === 'farmer');
    const customers = users.filter(u => u.role === 'customer');
    
    console.log(`Farmers: ${farmers.length}`);
    console.log(`Customers: ${customers.length}`);
    
    if (farmers.length === 0) {
      console.log(`\n❌ NO FARMER ACCOUNTS FOUND!`);
      console.log(`\n💡 SOLUTION:`);
      console.log(`   1. Register a new account as FARMER`);
      console.log(`   2. OR update existing account:`);
      console.log(`      node update-user-role.js`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🔍 Check and Fix Products\n');
checkAndFixProducts();
