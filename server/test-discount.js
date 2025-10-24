const mongoose = require('mongoose');
require('dotenv').config();

async function testDiscount() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');
    
    const Product = require('./models/Product');
    
    // Find Broccoli
    let broccoli = await Product.findOne({ title: 'Broccoli' });
    
    if (!broccoli) {
      console.log('❌ Broccoli not found');
      process.exit(1);
    }
    
    console.log('📦 BEFORE UPDATE:');
    console.log('  Title:', broccoli.title);
    console.log('  Discount:', `"${broccoli.discount}"`);
    console.log('  Type:', typeof broccoli.discount);
    
    // Update discount
    broccoli.discount = '12';
    await broccoli.save();
    console.log('\n💾 Saved discount = "12"\n');
    
    // Fetch fresh from database
    broccoli = await Product.findOne({ title: 'Broccoli' }).lean();
    
    console.log('📦 AFTER UPDATE (from database):');
    console.log('  Title:', broccoli.title);
    console.log('  Discount:', `"${broccoli.discount}"`);
    console.log('  Type:', typeof broccoli.discount);
    console.log('  Has field:', 'discount' in broccoli);
    
    // Test JSON serialization
    const json = JSON.stringify(broccoli);
    const parsed = JSON.parse(json);
    
    console.log('\n📤 AFTER JSON.parse(JSON.stringify()):');
    console.log('  Discount:', `"${parsed.discount}"`);
    console.log('  Has field:', 'discount' in parsed);
    
    if (broccoli.discount === '12') {
      console.log('\n✅ SUCCESS! Discount is saved and returned correctly!');
    } else {
      console.log('\n❌ FAILED! Discount is:', broccoli.discount);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDiscount();
