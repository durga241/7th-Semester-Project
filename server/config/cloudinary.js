const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    console.log('✅ Cloudinary configured');
    return true;
  } else {
    console.log('⚠️ Cloudinary not configured - image uploads will be skipped');
    return false;
  }
};

module.exports = { cloudinary, configureCloudinary };
