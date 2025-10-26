/* SMS Service using Twilio */
const twilio = require('twilio');

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    console.log('[TWILIO] ⚠️  Configuration incomplete');
    console.log('[TWILIO] TWILIO_ACCOUNT_SID exists:', !!accountSid);
    console.log('[TWILIO] TWILIO_AUTH_TOKEN exists:', !!authToken);
    console.log('[TWILIO] TWILIO_PHONE_NUMBER exists:', !!twilioPhone);
    return false;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[TWILIO] ✅ Client initialized successfully');
    console.log(`[TWILIO] Phone number: ${twilioPhone}`);
    return true;
  } catch (error) {
    console.error('[TWILIO] ❌ Initialization failed:', error.message);
    return false;
  }
};

// Send SMS using Twilio
const sendSMS = async (phone, message) => {
  try {
    // Initialize Twilio if not already done
    if (!twilioClient) {
      const initialized = initializeTwilio();
      if (!initialized) {
        console.log('[SMS] ❌ Twilio not configured. SMS not sent.');
        return { success: false, error: 'Twilio not configured' };
      }
    }

    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    // Format phone number for Twilio (must include country code)
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      // Add +91 for Indian numbers if not present
      formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
    }

    console.log(`[SMS] Sending to ${formattedPhone}...`);
    console.log(`[SMS] Message: ${message.substring(0, 50)}...`);

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone
    });

    console.log(`[SMS] ✅ Sent successfully! SID: ${result.sid}`);
    return { 
      success: true, 
      sid: result.sid,
      status: result.status 
    };

  } catch (error) {
    console.error('[SMS] ❌ Failed to send:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Send Order Confirmation SMS
const sendOrderConfirmationSMS = async (customerPhone, orderDetails) => {
  try {
    const {
      customerName,
      orderId,
      totalAmount,
      paymentMode,
      dateTime
    } = orderDetails;

    // Format message as specified
    const message = `Hi ${customerName},
✅ Thank you for shopping with Farmer Connect!
Your payment of ₹${totalAmount} has been successfully received.
Order ID: ${orderId}
Payment Mode: ${paymentMode}
Date: ${dateTime}
We'll notify you once your items are dispatched.
— Team Farmer Connect`;

    console.log(`[ORDER SMS] Sending confirmation to ${customerName} (${customerPhone})`);
    
    const result = await sendSMS(customerPhone, message);
    
    if (result.success) {
      console.log(`[ORDER SMS] ✅ Confirmation sent for Order ${orderId}`);
    } else {
      console.log(`[ORDER SMS] ❌ Failed for Order ${orderId}:`, result.error);
    }
    
    return result;
  } catch (error) {
    console.error('[ORDER SMS] Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send Offer Expiry SMS (for Weekly Offers)
const sendOfferExpirySMS = async (customerPhone, productDetails) => {
  try {
    const { productName, discount, timeLeft } = productDetails;
    
    const message = `⏰ LAST CHANCE! Offer on ${productName} (${discount}% OFF) ends in ${timeLeft}. Grab it now! - FarmConnect`;
    
    return await sendSMS(customerPhone, message);
  } catch (error) {
    console.error('[OFFER SMS] Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Bulk SMS for multiple customers
const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    console.log(`[BULK SMS] Sending to ${phoneNumbers.length} customers...`);
    
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const phone of phoneNumbers) {
      const result = await sendSMS(phone, message);
      results.push({ phone, result });
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Add small delay to avoid rate limiting (Twilio allows 1 msg/sec on trial)
      await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1 second delay
    }

    console.log(`[BULK SMS] ✅ Sent: ${successCount}, ❌ Failed: ${failCount}`);
    
    return {
      success: true,
      total: phoneNumbers.length,
      sent: successCount,
      failed: failCount,
      results
    };
  } catch (error) {
    console.error('[BULK SMS] Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeTwilio,
  sendSMS,
  sendOrderConfirmationSMS,
  sendOfferExpirySMS,
  sendBulkSMS
};
