const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Testing Cloudinary Configuration...\n');

console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET (hidden)' : 'NOT SET');

console.log('\nConfiguring Cloudinary...');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\nTesting upload with sample data...');

// Test with a small base64 image (1x1 pixel red dot)
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

cloudinary.uploader.upload(testImage, {
  folder: 'farmconnect/test',
  resource_type: 'auto'
})
  .then(result => {
    console.log('\n✅ SUCCESS! Cloudinary is working!');
    console.log('Uploaded image URL:', result.secure_url);
    console.log('\nYour Cloudinary configuration is correct.');
    console.log('The issue might be with how the image is being sent from frontend.');
    process.exit(0);
  })
  .catch(error => {
    console.log('\n❌ FAILED! Cloudinary upload error:');
    console.log('Error message:', error.message);
    console.log('Error details:', error.error);
    console.log('\n🔧 Possible fixes:');
    console.log('1. Check if credentials in .env are correct');
    console.log('2. Check if Cloudinary account is active');
    console.log('3. Check internet connection');
    process.exit(1);
  });
