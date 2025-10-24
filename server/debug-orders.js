// Debug script to check orders and why populate might be failing
const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

async function debugOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch orders without populate
    console.log('=== ORDERS WITHOUT POPULATE ===');
    const ordersRaw = await Order.find().sort({ createdAt: -1 }).limit(2);
    console.log(`Found ${ordersRaw.length} orders\n`);
    
    ordersRaw.forEach((order, idx) => {
      console.log(`\n--- Order ${idx + 1} (RAW) ---`);
      console.log('_id:', order._id);
      console.log('orderId:', order.orderId || 'NOT SET');
      console.log('customerId:', order.customerId);
      console.log('farmerId:', order.farmerId);
      console.log('products[0].productId:', order.products[0]?.productId);
      console.log('status:', order.status);
      console.log('total:', order.total);
    });

    // Fetch orders WITH populate
    console.log('\n\n=== ORDERS WITH POPULATE ===');
    const ordersPopulated = await Order.find()
      .populate('customerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .populate('products.productId', 'title imageUrl price category unit')
      .sort({ createdAt: -1 })
      .limit(2);
    
    ordersPopulated.forEach((order, idx) => {
      console.log(`\n--- Order ${idx + 1} (POPULATED) ---`);
      console.log('_id:', order._id);
      console.log('orderId:', order.orderId || 'NOT SET');
      console.log('customerId type:', typeof order.customerId);
      console.log('customerId:', order.customerId);
      console.log('customerId.name:', order.customerId?.name || 'NOT POPULATED');
      console.log('farmerId type:', typeof order.farmerId);
      console.log('farmerId:', order.farmerId);
      console.log('farmerId.name:', order.farmerId?.name || 'NOT POPULATED');
      console.log('products[0].productId type:', typeof order.products[0]?.productId);
      console.log('products[0].productId:', order.products[0]?.productId);
      console.log('products[0].productId.title:', order.products[0]?.productId?.title || 'NOT POPULATED');
    });

    // Check if referenced documents exist
    console.log('\n\n=== CHECKING REFERENCED DOCUMENTS ===');
    if (ordersRaw.length > 0) {
      const firstOrder = ordersRaw[0];
      
      console.log('\nChecking customerId:', firstOrder.customerId);
      const customer = await User.findById(firstOrder.customerId);
      console.log('Customer exists?', customer ? 'YES' : 'NO');
      if (customer) {
        console.log('Customer name:', customer.name);
        console.log('Customer email:', customer.email);
      }
      
      console.log('\nChecking farmerId:', firstOrder.farmerId);
      const farmer = await User.findById(firstOrder.farmerId);
      console.log('Farmer exists?', farmer ? 'YES' : 'NO');
      if (farmer) {
        console.log('Farmer name:', farmer.name);
        console.log('Farmer email:', farmer.email);
      }
      
      if (firstOrder.products.length > 0) {
        console.log('\nChecking productId:', firstOrder.products[0].productId);
        const product = await Product.findById(firstOrder.products[0].productId);
        console.log('Product exists?', product ? 'YES' : 'NO');
        if (product) {
          console.log('Product title:', product.title);
          console.log('Product price:', product.price);
        }
      }
    }

    // Check Order schema
    console.log('\n\n=== ORDER SCHEMA ===');
    const schema = Order.schema.obj;
    console.log('Has orderId field?', 'orderId' in schema);
    console.log('customerId ref:', schema.customerId?.ref);
    console.log('farmerId ref:', schema.farmerId?.ref);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

debugOrders();
