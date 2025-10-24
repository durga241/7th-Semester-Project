const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const Product = require('./models/Product');

async function fixDiscountField() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} products\n`);

    let fixedCount = 0;
    let alreadyHadDiscount = 0;

    for (const product of products) {
      console.log(`Checking: ${product.title}`);
      console.log(`  Current discount: "${product.discount}" (type: ${typeof product.discount})`);
      
      // If discount field doesn't exist or is null/undefined, set it to empty string
      if (product.discount === undefined || product.discount === null) {
        product.discount = '';
        await product.save();
        console.log(`  ✅ Fixed - Set discount to empty string`);
        fixedCount++;
      } else {
        console.log(`  ✓ Already has discount field`);
        alreadyHadDiscount++;
      }
      console.log('');
    }

    console.log('\n📊 Summary:');
    console.log(`  Total products: ${products.length}`);
    console.log(`  Fixed (added discount field): ${fixedCount}`);
    console.log(`  Already had discount: ${alreadyHadDiscount}`);
    
    // Now fetch one product to verify
    console.log('\n🔍 Verifying fix - Fetching Broccoli:');
    const broccoli = await Product.findOne({ title: 'Broccoli' });
    if (broccoli) {
      console.log('  Title:', broccoli.title);
      console.log('  Discount:', broccoli.discount);
      console.log('  Discount type:', typeof broccoli.discount);
      console.log('  Has discount field:', broccoli.hasOwnProperty('discount'));
    } else {
      console.log('  ⚠️ Broccoli product not found');
    }

    console.log('\n🎉 All done! You can now set discounts on products.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDiscountField();
