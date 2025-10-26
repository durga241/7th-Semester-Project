const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendOrderConfirmationSMS } = require('../services/smsService');

// Initialize Stripe with test mode configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
  throw new Error('Stripe configuration missing');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2,
});

// Log Stripe mode
const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
console.log(`🔧 Stripe initialized in ${isTestMode ? 'TEST' : 'LIVE'} mode`);

if (!isTestMode) {
  console.warn('⚠️ WARNING: Using LIVE Stripe keys! Make sure this is intentional.');
}

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
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
    const lineItems = [];
    
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
      
      // Calculate price with discount if applicable
      const effectivePrice = product.discount && product.discount > 0 
        ? product.price - (product.price * product.discount / 100)
        : product.price;
      
      const itemTotal = effectivePrice * item.quantity;
      total += itemTotal;
      
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: effectivePrice // Store discounted price in order
      });

      // Create line items for Stripe
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.title,
            description: product.description || product.category,
            images: product.imageUrl ? [product.imageUrl] : [],
          },
          unit_amount: Math.round(effectivePrice * 100), // Convert to paise, use discounted price
        },
        quantity: item.quantity,
      });
    }

    // Get farmer ID from first product
    const firstProduct = await Product.findById(items[0].productId);
    
    // Create order in database with pending status
    const order = await Order.create({
      customerId: req.user.uid,
      farmerId: firstProduct.farmerId,
      products: orderProducts,
      total,
      status: 'pending',
      paymentInfo: {
        method: 'stripe',
        paymentStatus: 'pending'
      },
      shippingAddress
    });

    console.log(`✅ Order created: ${order._id}`);
    console.log(`💰 Total amount: ₹${total}`);
    console.log(`📦 Items: ${items.length}`);

    // Determine the frontend URL
    const frontendUrl = process.env.VITE_API_URL?.replace(':3001', ':5173') || 'http://localhost:5173';
    console.log(`🌐 Frontend URL: ${frontendUrl}`);

    // Create Stripe Checkout Session
    // NOTE: Logo branding must be configured in Stripe Dashboard (Settings > Branding)
    // The 'branding' parameter is not supported in the API
    // See docs/STRIPE_BRANDING_SETUP.md for instructions
    console.log('🔄 Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${frontendUrl}/payment-cancel?order_id=${order._id}`,
      customer_email: req.user.email,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        customerId: req.user.uid,
        environment: isTestMode ? 'test' : 'live',
      },
      // Enable test mode features
      ...(isTestMode && {
        payment_intent_data: {
          description: `Test Order ${order._id}`,
        },
      }),
    });

    // Update order with Stripe session ID
    order.paymentInfo.stripeSessionId = session.id;
    await order.save();

    console.log(`✅ Stripe session created: ${session.id}`);
    console.log(`🔗 Checkout URL: ${session.url}`);

    res.json({
      ok: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id,
      testMode: isTestMode
    });
    
  } catch (err) {
    console.error('❌ Create Stripe session error:', err);
    console.error('Error details:', {
      message: err.message,
      type: err.type,
      code: err.code,
      statusCode: err.statusCode
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create payment session';
    if (err.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please check your API keys.';
    } else if (err.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request to Stripe: ' + err.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ ok: false, error: errorMessage });
  }
};

// Verify Stripe Payment (called after successful payment)
exports.verifyStripePayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;
    
    console.log(`🔍 Verifying payment for session: ${sessionId}`);
    console.log(`📋 Order ID: ${orderId}`);
    
    if (!sessionId || !orderId) {
      return res.status(400).json({ ok: false, error: 'Missing session ID or order ID' });
    }

    // Retrieve the session from Stripe
    console.log('🔄 Retrieving session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }

    // Find order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    console.log(`💳 Payment status: ${session.payment_status}`);
    console.log(`💰 Amount: ${session.amount_total / 100} ${session.currency.toUpperCase()}`);

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed by Stripe');
      
      // Update order status
      order.paymentInfo.stripePaymentId = session.payment_intent;
      order.paymentInfo.paymentStatus = 'completed';
      order.status = 'confirmed';
      await order.save();
      console.log(`📝 Order status updated to confirmed`);

      // Update product quantities
      console.log(`📦 Updating product quantities...`);
      for (const item of order.products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity } }
        );
        console.log(`  - Product ${item.productId}: -${item.quantity}`);
      }

      // Create notification for farmer
      try {
        const customer = await User.findById(order.customerId);
        await Notification.create({
          farmerId: order.farmerId,
          type: 'order',
          title: 'New Order Received!',
          message: `You have received a new order from ${customer?.name || 'a customer'}`,
          orderId: order._id,
          metadata: {
            customerName: customer?.name || 'Customer',
            orderTotal: order.total,
            productCount: order.products.length
          }
        });
        console.log(`✅ Notification created for farmer: ${order.farmerId}`);
      } catch (notifError) {
        console.error('⚠️ Failed to create notification:', notifError);
        // Don't fail the order if notification fails
      }

      // Send SMS confirmation to customer
      try {
        const customer = await User.findById(order.customerId);
        if (customer && customer.phone) {
          const orderDate = new Date(order.createdAt);
          const formattedDate = orderDate.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
          });

          await sendOrderConfirmationSMS(customer.phone, {
            customerName: customer.name,
            orderId: order._id.toString().substring(0, 8).toUpperCase(),
            totalAmount: order.total.toFixed(2),
            paymentMode: 'Stripe (Card/UPI)',
            dateTime: formattedDate
          });
          console.log(`📱 SMS confirmation sent to customer: ${customer.phone}`);
        } else {
          console.log(`⚠️ Customer phone number not available for SMS`);
        }
      } catch (smsError) {
        console.error('⚠️ Failed to send SMS confirmation:', smsError.message);
        // Don't fail the order if SMS fails
      }

      console.log(`✅ Payment verified and order confirmed: ${order._id}`);
      
      return res.json({
        ok: true,
        message: 'Payment verified successfully',
        order,
        testMode: isTestMode
      });
    } else {
      console.log(`⚠️ Payment not completed. Status: ${session.payment_status}`);
      return res.status(400).json({ 
        ok: false, 
        error: 'Payment not completed',
        paymentStatus: session.payment_status 
      });
    }
    
  } catch (err) {
    console.error('❌ Verify Stripe payment error:', err);
    console.error('Error details:', {
      message: err.message,
      type: err.type,
      code: err.code
    });
    
    let errorMessage = 'Payment verification failed';
    if (err.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid session ID or session not found';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ ok: false, error: errorMessage });
  }
};

// Handle payment cancellation
exports.handlePaymentCancel = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ ok: false, error: 'Missing order ID' });
    }

    // Find and update order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    // Update order status to cancelled
    order.paymentInfo.paymentStatus = 'cancelled';
    order.status = 'cancelled';
    await order.save();

    console.log(`⚠️ Payment cancelled for order: ${order._id}`);
    
    res.json({
      ok: true,
      message: 'Order cancelled',
      order
    });
    
  } catch (err) {
    console.error('❌ Handle payment cancel error:', err);
    res.status(500).json({ ok: false, error: 'Failed to cancel order: ' + err.message });
  }
};

// Webhook handler for Stripe events (optional but recommended for production)
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.log('⚠️ Stripe webhook secret not configured');
    return res.status(400).json({ ok: false, error: 'Webhook not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ ok: false, error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const orderId = session.metadata.orderId;
      
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentInfo.paymentStatus !== 'completed') {
          order.paymentInfo.stripePaymentId = session.payment_intent;
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

          // Create notification for farmer
          try {
            const customer = await User.findById(order.customerId);
            await Notification.create({
              farmerId: order.farmerId,
              type: 'order',
              title: 'New Order Received!',
              message: `You have received a new order from ${customer?.name || 'a customer'}`,
              orderId: order._id,
              metadata: {
                customerName: customer?.name || 'Customer',
                orderTotal: order.total,
                productCount: order.products.length
              }
            });
            console.log(`✅ Webhook: Notification created for farmer: ${order.farmerId}`);
          } catch (notifError) {
            console.error('⚠️ Webhook: Failed to create notification:', notifError);
          }

          // Send SMS confirmation to customer (Webhook)
          try {
            const customer = await User.findById(order.customerId);
            if (customer && customer.phone) {
              const orderDate = new Date(order.createdAt);
              const formattedDate = orderDate.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Kolkata'
              });

              await sendOrderConfirmationSMS(customer.phone, {
                customerName: customer.name,
                orderId: order._id.toString().substring(0, 8).toUpperCase(),
                totalAmount: order.total.toFixed(2),
                paymentMode: 'Stripe (Card/UPI)',
                dateTime: formattedDate
              });
              console.log(`📱 Webhook: SMS confirmation sent to: ${customer.phone}`);
            }
          } catch (smsError) {
            console.error('⚠️ Webhook: Failed to send SMS:', smsError.message);
          }

          console.log(`✅ Webhook: Order confirmed: ${order._id}`);
        }
      }
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      const expiredOrderId = expiredSession.metadata.orderId;
      
      if (expiredOrderId) {
        const order = await Order.findById(expiredOrderId);
        if (order && order.paymentInfo.paymentStatus === 'pending') {
          order.paymentInfo.paymentStatus = 'expired';
          order.status = 'cancelled';
          await order.save();
          console.log(`⚠️ Webhook: Order expired: ${order._id}`);
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
