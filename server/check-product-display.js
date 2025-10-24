require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

async function checkProductDisplay() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Get all products with farmer info
    const products = await Product.find({}).populate('farmerId');
    console.log(`\n📦 Found ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log('✅ Database is empty');
      console.log('\n📝 Next steps:');
      console.log('1. Login as farmer');
      console.log('2. Add products from farmer dashboard');
      console.log('3. Run this script again to verify');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PRODUCT DATA ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let hasIssues = false;
    
    products.forEach((p, i) => {
      console.log(`\n${i + 1}. PRODUCT: ${p._id}`);
      console.log('─'.repeat(70));
      
      // Title
      console.log(`📝 Title: "${p.title}"`);
      if (p.title && (p.title.includes('http://') || p.title.includes('/uploads/'))) {
        console.log('   ❌ ISSUE: Title is an image URL (should be product name)');
        hasIssues = true;
      } else {
        console.log('   ✅ Title looks good');
      }
      
      // Description
      console.log(`📄 Description: "${p.description}"`);
      
      // Price
      console.log(`💰 Price: ₹${p.price}`);
      if (!p.price || p.price <= 0) {
        console.log('   ❌ ISSUE: Invalid price');
        hasIssues = true;
      } else {
        console.log('   ✅ Price is valid');
      }
      
      // Quantity
      console.log(`📊 Quantity: ${p.quantity} kg`);
      if (!p.quantity || p.quantity <= 0) {
        console.log('   ❌ ISSUE: Invalid quantity');
        hasIssues = true;
      } else {
        console.log('   ✅ Quantity is valid');
      }
      
      // Category
      console.log(`🏷️  Category: ${p.category}`);
      
      // Image URL
      console.log(`🖼️  Image URL: ${p.imageUrl || 'No image'}`);
      if (!p.imageUrl) {
        console.log('   ⚠️  WARNING: No image URL');
      } else if (p.imageUrl.startsWith('/uploads/')) {
        console.log('   ✅ Local upload (will be: http://localhost:3001' + p.imageUrl + ')');
      } else if (p.imageUrl.startsWith('http://') || p.imageUrl.startsWith('https://')) {
        console.log('   ✅ External URL');
      } else {
        console.log('   ⚠️  WARNING: Unusual image URL format');
      }
      
      // Farmer
      console.log(`👤 Farmer ID: ${p.farmerId?._id || 'No farmer'}`);
      console.log(`👤 Farmer Name: ${p.farmerId?.name || 'Unknown'}`);
      console.log(`📧 Farmer Email: ${p.farmerId?.email || 'Unknown'}`);
      console.log(`🎭 Farmer Role: ${p.farmerId?.role || 'Unknown'}`);
      
      if (!p.farmerId) {
        console.log('   ❌ ISSUE: No farmer assigned');
        hasIssues = true;
      } else {
        console.log('   ✅ Farmer info populated');
      }
      
      // What customer will see
      console.log('\n📱 CUSTOMER VIEW:');
      console.log('─'.repeat(70));
      console.log(`   Product Name: ${p.title}`);
      console.log(`   Price: ₹${p.price}/kg`);
      console.log(`   Farmer: ${p.farmerId?.name || 'Unknown Farmer'}`);
      console.log(`   Image: ${p.imageUrl ? (p.imageUrl.startsWith('/uploads/') ? 'http://localhost:3001' + p.imageUrl : p.imageUrl) : '📦 (emoji)'}`);
      console.log(`   Stock: ${p.quantity} kg`);
      console.log(`   Category: ${p.category}`);
    });
    
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Total Products: ${products.length}`);
    
    if (hasIssues) {
      console.log('\n❌ ISSUES FOUND!');
      console.log('\n💡 SOLUTION:');
      console.log('   Run: node delete-all-bad-products.js');
      console.log('   Then add products again from farmer dashboard');
    } else {
      console.log('\n✅ All products look good!');
      console.log('\n📝 If images are not displaying:');
      console.log('   1. Make sure server is running (node index.js)');
      console.log('   2. Check if images exist in server/uploads/ folder');
      console.log('   3. Try accessing image directly:');
      products.forEach(p => {
        if (p.imageUrl && p.imageUrl.startsWith('/uploads/')) {
          console.log(`      http://localhost:3001${p.imageUrl}`);
        }
      });
      console.log('   4. Refresh browser (F5)');
      console.log('   5. Clear browser cache');
    }
    
    // Check uploads folder
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('UPLOADS FOLDER CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`📁 Found ${files.length} files in uploads folder:`);
      files.forEach(file => {
        const stats = fs.statSync(path.join(uploadsDir, file));
        console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
      
      if (files.length === 0) {
        console.log('\n⚠️  Uploads folder is empty!');
        console.log('   This means no images have been uploaded yet.');
      }
    } else {
      console.log('❌ Uploads folder does not exist!');
      console.log('   Creating it now...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('   ✅ Created uploads folder');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('🔍 CHECK PRODUCT DISPLAY\n');
console.log('This script will:');
console.log('1. Check all products in database');
console.log('2. Verify data integrity');
console.log('3. Show what customers will see');
console.log('4. Check uploads folder\n');

checkProductDisplay();
