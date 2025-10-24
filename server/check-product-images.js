const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const Product = require('./models/Product');

async function checkProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmconnect');
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({}).populate('farmerId', 'name email');
    
    console.log(`📦 Total products in database: ${products.length}\n`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Product: ${product.title}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Farmer: ${product.farmerId?.name || 'Unknown'}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.quantity}`);
      console.log(`   Has imageUrl: ${product.imageUrl ? '✅ YES' : '❌ NO'}`);
      if (product.imageUrl) {
        console.log(`   Image URL: ${product.imageUrl.substring(0, 50)}...`);
      }
      console.log(`   Sold: ${product.sold || 0}`);
      console.log(`   Unit: ${product.unit || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    const withImages = products.filter(p => p.imageUrl).length;
    const withoutImages = products.filter(p => !p.imageUrl).length;
    console.log(`Products with images: ${withImages}`);
    console.log(`Products without images: ${withoutImages}`);
    
    if (withoutImages > 0) {
      console.log('\n⚠️  Products without images will show an emoji icon.');
      console.log('💡 To fix: Edit and re-upload images for these products.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProductImages();
