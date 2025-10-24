// Test script to check orders in database
const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

async function testOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all orders
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .populate('products.productId', 'title imageUrl price category unit');

    console.log(`\n📦 Found ${orders.length} orders in database\n`);

    orders.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log('Order ID:', order._id);
      console.log('Customer:', order.customerId?.name || 'NOT POPULATED');
      console.log('Customer ID:', order.customerId?._id || order.customerId);
      console.log('Farmer:', order.farmerId?.name || 'NOT POPULATED');
      console.log('Farmer ID:', order.farmerId?._id || order.farmerId);
      console.log('Total:', order.total);
      console.log('Status:', order.status);
      console.log('Products:');
      order.products.forEach((p, idx) => {
        console.log(`  ${idx + 1}. Product:`, p.productId?.title || 'NOT POPULATED');
        console.log(`     Product ID:`, p.productId?._id || p.productId);
        console.log(`     Quantity:`, p.quantity);
        console.log(`     Price:`, p.price);
      });
      console.log('Shipping Address:', order.shippingAddress);
    });

    // Check if products exist
    console.log('\n\n--- Checking Products ---');
    const products = await Product.find().limit(5);
    console.log(`Found ${products.length} products in database`);
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.title} (ID: ${p._id}) - Farmer: ${p.farmerId}`);
    });

    // Check if users exist
    console.log('\n\n--- Checking Users ---');
    const users = await User.find().limit(5);
    console.log(`Found ${users.length} users in database`);
    users.forEach((u, idx) => {
      console.log(`${idx + 1}. ${u.name} (ID: ${u._id}) - Role: ${u.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testOrders();
