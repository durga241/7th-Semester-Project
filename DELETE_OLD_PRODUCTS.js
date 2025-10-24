/**
 * Script to delete all products without imageUrl
 * This will clean up old products that were created before Cloudinary was set up
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dp_project:Durga%40123@project-work.cvmqosn.mongodb.net/farmconnect';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
  visibility: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function deleteProductsWithoutImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products
    const allProducts = await Product.find({});
    console.log(`\n📦 Total products in database: ${allProducts.length}`);

    // Find products without imageUrl
    const productsWithoutImages = await Product.find({
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: null },
        { imageUrl: '' }
      ]
    });

    console.log(`\n🖼️  Products WITHOUT images: ${productsWithoutImages.length}`);
    
    if (productsWithoutImages.length > 0) {
      console.log('\nProducts to be deleted:');
      productsWithoutImages.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.category}) - No imageUrl`);
      });

      // Delete products without images
      const result = await Product.deleteMany({
        $or: [
          { imageUrl: { $exists: false } },
          { imageUrl: null },
          { imageUrl: '' }
        ]
      });

      console.log(`\n✅ Deleted ${result.deletedCount} products without images`);
    } else {
      console.log('\n✅ All products have images!');
    }

    // Show remaining products
    const remainingProducts = await Product.find({});
    console.log(`\n📊 Remaining products: ${remainingProducts.length}`);
    
    if (remainingProducts.length > 0) {
      console.log('\nRemaining products:');
      remainingProducts.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} - imageUrl: ${p.imageUrl ? '✅' : '❌'}`);
      });
    }

    console.log('\n🎉 Cleanup complete!');
    console.log('\n👉 Now add new products with images in the dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
deleteProductsWithoutImages();
