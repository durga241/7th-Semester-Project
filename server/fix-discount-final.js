const mongoose = require('mongoose');
require('dotenv').config();

async function fixDiscount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const Product = require('./models/Product');
    
    // Find Broccoli
    const broccoli = await Product.findOne({ title: 'Broccoli' });
    
    if (!broccoli) {
      console.log('❌ Broccoli product not found');
      process.exit(1);
    }
    
    console.log('📦 Current Broccoli data:');
    console.log('  Title:', broccoli.title);
    console.log('  Discount:', broccoli.discount);
    console.log('  Discount type:', typeof broccoli.discount);
    console.log('  Has discount field:', 'discount' in broccoli);
    
    // Set discount to 12
    broccoli.discount = '12';
    await broccoli.save();
    
    console.log('\n✅ Updated Broccoli discount to: 12');
    
    // Verify it was saved
    const updated = await Product.findById(broccoli._id);
    console.log('\n📦 Verified saved data:');
    console.log('  Title:', updated.title);
    console.log('  Discount:', updated.discount);
    console.log('  Discount type:', typeof updated.discount);
    
    // Now update ALL products to have discount field
    const result = await Product.updateMany(
      { discount: { $exists: false } },
      { $set: { discount: '' } }
    );
    
    console.log(`\n✅ Added discount field to ${result.modifiedCount} products\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDiscount();
