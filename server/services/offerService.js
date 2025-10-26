const Product = require('../models/Product');
const User = require('../models/User');
const { sendOfferExpirySMS } = require('./smsService');

// Check for expiring offers and send notifications
const checkExpiringOffers = async () => {
  try {
    console.log('[OFFER SERVICE] Checking for expiring offers...');
    
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // Changed from 3 hours to 1 hour

    // Find products with offers expiring in the next 1 hour that haven't been notified
    const expiringProducts = await Product.find({
      discount: { $gt: 0 },
      offerEndDate: {
        $gte: now,
        $lte: oneHourFromNow  // Changed from threeHoursFromNow to oneHourFromNow
      },
      smsNotificationSent: false,
      offerExpired: false
    }).populate('farmerId', 'name');

    console.log(`[OFFER SERVICE] Found ${expiringProducts.length} expiring offers`);

    if (expiringProducts.length === 0) {
      return { sent: 0, message: 'No expiring offers found' };
    }

    // Get all customers with phone numbers
    const customers = await User.find({ 
      role: 'customer', 
      phone: { $exists: true, $ne: '' }
    });

    console.log(`[OFFER SERVICE] Found ${customers.length} customers with phone numbers`);

    let sentCount = 0;

    // Send SMS to all customers for each expiring product
    for (const product of expiringProducts) {
      const timeLeft = product.offerEndDate - now;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const timeLeftStr = `${hoursLeft}h ${minutesLeft}m`;

      for (const customer of customers) {
        if (customer.phone && customer.phone.length >= 10) {
          const result = await sendOfferExpirySMS(customer.phone, {
            productName: product.title,
            discount: product.discount,
            timeLeft: timeLeftStr
          });
          
          if (result.success) {
            sentCount++;
          }
          
          // Add delay to avoid Twilio rate limiting (1.1 sec for trial accounts)
          await new Promise(resolve => setTimeout(resolve, 1100));
        }
      }

      // Mark product as notified
      product.smsNotificationSent = true;
      await product.save();
      console.log(`[OFFER SERVICE] ✅ Marked ${product.title} as notified`);
    }

    return { sent: sentCount, products: expiringProducts.length };
  } catch (error) {
    console.error('[OFFER SERVICE] Error:', error);
    return { error: error.message };
  }
};

// Check for expired offers and mark them
const checkExpiredOffers = async () => {
  try {
    console.log('[OFFER SERVICE] Checking for expired offers...');
    
    const now = new Date();

    // Find expired offers
    const expiredProducts = await Product.find({
      discount: { $gt: 0 },
      offerEndDate: { $lt: now },
      offerExpired: false
    });

    console.log(`[OFFER SERVICE] Found ${expiredProducts.length} expired offers`);

    for (const product of expiredProducts) {
      product.offerExpired = true;
      product.discount = 0; // Remove discount
      await product.save();
      console.log(`[OFFER SERVICE] ⛔ Marked ${product.title} as expired`);
    }

    return { expired: expiredProducts.length };
  } catch (error) {
    console.error('[OFFER SERVICE] Error:', error);
    return { error: error.message };
  }
};

// Get active offers (not expired)
const getActiveOffers = async () => {
  try {
    const now = new Date();
    
    const activeOffers = await Product.find({
      discount: { $gt: 0 },
      offerEndDate: { $gte: now },
      offerExpired: false
    }).populate('farmerId', 'name').sort({ offerEndDate: 1 });

    return activeOffers;
  } catch (error) {
    console.error('[OFFER SERVICE] Error getting active offers:', error);
    return [];
  }
};

module.exports = {
  checkExpiringOffers,
  checkExpiredOffers,
  getActiveOffers
};
