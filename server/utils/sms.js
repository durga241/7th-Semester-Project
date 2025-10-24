const axios = require('axios');

/**
 * Send SMS using Fast2SMS
 * @param {string} to - Phone number to send to (10 digits: 9876543210 or with +91)
 * @param {string} message - Message to send
 * @returns {Promise} Fast2SMS response
 */
const sendSMS = async (to, message) => {
  try {
    console.log('🔍 Checking Fast2SMS configuration...');
    console.log('📱 API Key present:', !!process.env.FAST2SMS_API_KEY);
    console.log('📱 API Key length:', process.env.FAST2SMS_API_KEY?.length || 0);
    
    // Check if Fast2SMS is configured
    if (!process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY === 'your_fast2sms_api_key_here') {
      console.log('⚠️ Fast2SMS not configured, SMS not sent');
      console.log(`📱 Would send to ${to}: ${message}`);
      return { success: false, message: 'Fast2SMS not configured' };
    }

    // Clean phone number (remove +91 if present, keep only 10 digits)
    let phoneNumber = to.replace(/\D/g, ''); // Remove non-digits
    
    console.log(`📱 Cleaning phone number: ${to} → ${phoneNumber} (${phoneNumber.length} digits)`);
    
    // Remove country code if present (91)
    if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
      phoneNumber = phoneNumber.substring(2);
      console.log(`📱 Removed country code 91: ${phoneNumber}`);
    }
    
    // Remove leading zero if present (common in India: 07569294090)
    if (phoneNumber.startsWith('0') && phoneNumber.length === 11) {
      phoneNumber = phoneNumber.substring(1);
      console.log(`📱 Removed leading zero: ${phoneNumber}`);
    }
    
    // Validate phone number (must be exactly 10 digits)
    if (phoneNumber.length !== 10) {
      console.log(`❌ Invalid phone number: ${to} → cleaned: ${phoneNumber} (must be 10 digits, got ${phoneNumber.length})`);
      return { success: false, message: 'Invalid phone number format' };
    }
    
    console.log(`✅ Phone number cleaned successfully: ${phoneNumber}`);

    // Fast2SMS API endpoint
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    // Prepare request - using route 'q' (quick transactional) which works better
    const response = await axios.post(url, {
      route: 'q',
      message: message,
      language: 'english',
      flash: 0,
      numbers: phoneNumber
    }, {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Check response
    if (response.data && response.data.return === true) {
      console.log(`✅ SMS sent successfully to ${phoneNumber}`);
      console.log(`📱 Message ID: ${response.data.message_id || 'N/A'}`);
      
      return {
        success: true,
        messageId: response.data.message_id,
        status: 'sent'
      };
    } else {
      console.log(`⚠️ Fast2SMS API returned error:`, response.data);
      return {
        success: false,
        message: response.data.message || 'Failed to send SMS'
      };
    }

  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    console.log(`📱 Failed to send to ${to}`);
    
    // Log essential error details only (no verbose headers)
    if (error.response?.data) {
      console.error('📱 API Error:', JSON.stringify(error.response.data));
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

module.exports = sendSMS;
