const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const Product = require('./models/Product');

async function updateDiscounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Set specific discounts for each product
    const discountMap = {
      'Almond': '50',
      'Rice flour': '15',
      'Pomogranate': '45',
      'Pomegranate': '45',
      'Snakeguard': '35',
      'Lemon': '30',
      'Carrot': '25',
      'Tomato': '20',
      'Potato': '15',
      'Onion': '18'
    };

    for (const product of products) {
      const discount = discountMap[product.title] || '10'; // Default 10% if not specified
      product.discount = discount;
      await product.save();
      console.log(`✅ Updated ${product.title}: ${discount}% discount`);
    }

    console.log('\n🎉 All products updated with discounts!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateDiscounts();
