require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function fixProductData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Get all products
    const products = await Product.find({}).populate('farmerId');
    console.log(`\n📦 Found ${products.length} products:\n`);
    
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`\n${i + 1}. Product ID: ${p._id}`);
      console.log(`   Title: ${p.title}`);
      console.log(`   Description: ${p.description}`);
      console.log(`   Price: ₹${p.price}`);
      console.log(`   Quantity: ${p.quantity}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Image URL: ${p.imageUrl}`);
      console.log(`   Farmer ID: ${p.farmerId}`);
      if (p.farmerId && p.farmerId.name) {
        console.log(`   Farmer Name: ${p.farmerId.name}`);
        console.log(`   Farmer Email: ${p.farmerId.email}`);
      }
      
      // Check if data looks wrong
      let needsFix = false;
      const fixes = {};
      
      // Check if title is actually an image URL
      if (p.title && (p.title.includes('http://') || p.title.includes('/uploads/'))) {
        console.log(`   ⚠️  WARNING: Title looks like an image URL!`);
        needsFix = true;
        // Move title to imageUrl
        fixes.imageUrl = p.title;
        // Set title to something reasonable
        fixes.title = 'Product ' + (i + 1);
      }
      
      // Check if price is wrong (should be a number)
      if (typeof p.price !== 'number' || p.price <= 0) {
        console.log(`   ⚠️  WARNING: Price is invalid!`);
        needsFix = true;
        fixes.price = 24; // Default price
      }
      
      // Check if quantity is wrong
      if (typeof p.quantity !== 'number' || p.quantity <= 0) {
        console.log(`   ⚠️  WARNING: Quantity is invalid!`);
        needsFix = true;
        fixes.quantity = 100; // Default quantity
      }
      
      if (needsFix) {
        console.log(`\n   🔧 Fixing product...`);
        console.log(`   Fixes to apply:`, fixes);
        
        // Apply fixes
        await Product.findByIdAndUpdate(p._id, fixes);
        console.log(`   ✅ Product fixed!`);
      } else {
        console.log(`   ✅ Product data looks good!`);
      }
    }
    
    console.log('\n\n📋 Summary:');
    console.log(`Total products: ${products.length}`);
    
    // Show final state
    console.log('\n\n🔍 Final product list:');
    const updatedProducts = await Product.find({}).populate('farmerId');
    updatedProducts.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.title}`);
      console.log(`   Price: ₹${p.price}/kg`);
      console.log(`   Stock: ${p.quantity} kg`);
      console.log(`   Image: ${p.imageUrl || 'No image'}`);
      console.log(`   Farmer: ${p.farmerId?.name || 'Unknown'}`);
    });
    
    console.log('\n\n✅ Done! Refresh your browser to see the changes.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🔧 Fix Product Data\n');
console.log('This script will:');
console.log('1. Check all products in database');
console.log('2. Detect wrong data (title as image URL, wrong price, etc.)');
console.log('3. Fix the issues automatically\n');

fixProductData();
