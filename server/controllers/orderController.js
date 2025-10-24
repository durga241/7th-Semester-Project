const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Create new order with Razorpay
exports.createPayment = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'No items in order' });
    }
    
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ ok: false, error: 'Incomplete shipping address' });
    }

    // Calculate total and validate products
    let total = 0;
    const orderProducts = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ ok: false, error: `Product ${item.productId} not found` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ ok: false, error: `Insufficient stock for ${product.title}` });
      }
      
      if (product.status !== 'available') {
        return res.status(400).json({ ok: false, error: `Product ${product.title} is not available` });
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Get farmer ID from first product
    const firstProduct = await Product.findById(items[0].productId);
    
    // Create order in database
    const order = await Order.create({
      customerId: req.user.uid,
      farmerId: firstProduct.farmerId,
      products: orderProducts,
      total,
      status: 'pending',
      paymentInfo: {
        method: 'razorpay',
        paymentStatus: 'pending'
      },
      shippingAddress
    });

    console.log(`✅ Order created: ${order._id}`);

    // Initialize Razorpay order
    const Razorpay = require('razorpay');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.log('⚠️ Razorpay not configured, using test mode');
      
      // For development without Razorpay
      return res.json({
        ok: true,
        orderId: order._id,
        razorpayOrder: {
          id: 'test_order_' + Date.now(),
          amount: total * 100,
          currency: 'INR',
          key: 'test_key'
        }
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Convert to paise
      currency: 'INR',
      receipt: order._id.toString(),
      payment_capture: 1
    });

    // Update order with Razorpay order ID
    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      ok: true,
      orderId: order._id,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
    
  } catch (err) {
    console.error('❌ Create payment error:', err);
    res.status(500).json({ ok: false, error: 'Failed to create payment: ' + err.message });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    if (!razorpayOrderId) {
      return res.status(400).json({ ok: false, error: 'Missing order ID' });
    }

    // Find order by Razorpay order ID
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });
    
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    // If in test mode (no signature), mark as completed
    if (!razorpaySignature || razorpayOrderId.startsWith('test_')) {
      order.paymentInfo.paymentStatus = 'completed';
      order.status = 'confirmed';
      await order.save();

      // Update product quantities
      for (const item of order.products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity } }
        );
      }

      console.log(`✅ Order confirmed (test mode): ${order._id}`);
      
      return res.json({
        ok: true,
        message: 'Payment verified successfully',
        order
      });
    }

    // Verify signature with Razorpay
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ ok: false, error: 'Invalid payment signature' });
    }

    // Update order status
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.paymentInfo.razorpaySignature = razorpaySignature;
    order.paymentInfo.paymentStatus = 'completed';
    order.status = 'confirmed';
    await order.save();

    // Update product quantities
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } }
      );
    }

    console.log(`✅ Payment verified and order confirmed: ${order._id}`);
    
    res.json({
      ok: true,
      message: 'Payment verified successfully',
      order
    });
    
  } catch (err) {
    console.error('❌ Verify payment error:', err);
    res.status(500).json({ ok: false, error: 'Payment verification failed: ' + err.message });
  }
};

// Get orders for a farmer
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.params.farmerId })
      .populate('customerId', 'name email phone')
      .populate('products.productId', 'title imageUrl category')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, orders });
  } catch (err) {
    console.error('❌ Get farmer orders error:', err);
    res.json({ ok: true, orders: [] });
  }
};

// Get orders for a customer
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.uid })
      .populate('farmerId', 'name email phone')
      .populate('products.productId', 'title imageUrl category')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, orders });
  } catch (err) {
    console.error('❌ Get customer orders error:', err);
    res.json({ ok: true, orders: [] });
  }
};

// Update order status (farmer only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }
    
    // Check if user is the farmer for this order
    if (String(order.farmerId) !== req.user.uid) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    
    order.status = status;
    await order.save();
    
    console.log(`✅ Order status updated: ${order._id} -> ${status}`);
    
    res.json({ ok: true, order });
  } catch (err) {
    console.error('❌ Update order status error:', err);
    res.status(500).json({ ok: false, error: 'Failed to update order status' });
  }
};
