require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const sampleProducts = [
  {
    title: 'Fresh Organic Tomatoes',
    description: 'Juicy red tomatoes grown without pesticides',
    price: 39,
    quantity: 100,
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Sweet Carrots',
    description: 'Crunchy and sweet carrots, perfect for salads',
    price: 45,
    quantity: 80,
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Farm Fresh Potatoes',
    description: 'High-quality potatoes for all your cooking needs',
    price: 25,
    quantity: 150,
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Red Onions',
    description: 'Fresh red onions with strong flavor',
    price: 30,
    quantity: 120,
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Green Capsicum',
    description: 'Crisp green bell peppers',
    price: 50,
    quantity: 60,
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Fresh Spinach',
    description: 'Leafy green spinach packed with nutrients',
    price: 20,
    quantity: 50,
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Organic Apples',
    description: 'Sweet and crispy red apples',
    price: 120,
    quantity: 80,
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    status: 'available',
    visibility: 'visible'
  },
  {
    title: 'Fresh Bananas',
    description: 'Ripe yellow bananas, rich in potassium',
    price: 40,
    quantity: 100,
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400',
    status: 'available',
    visibility: 'visible'
  }
];

async function importProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Find a farmer
    const farmer = await User.findOne({ role: 'farmer' });
    
    if (!farmer) {
      console.log('❌ No farmer found in database!');
      console.log('Please create a farmer account first.');
      return;
    }
    
    console.log('✅ Found farmer:', farmer.name, '(', farmer.email, ')');
    console.log('\n📦 Importing sample products...\n');
    
    // Clear existing products (optional)
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing products.`);
      console.log('Deleting existing products...');
      await Product.deleteMany({});
      console.log('✅ Existing products deleted.\n');
    }
    
    // Import products
    let imported = 0;
    for (const productData of sampleProducts) {
      const product = await Product.create({
        ...productData,
        farmerId: farmer._id
      });
      
      imported++;
      console.log(`✅ ${imported}. ${product.title} - ₹${product.price} (${productData.category})`);
    }
    
    console.log(`\n✅ Successfully imported ${imported} products!`);
    
    // Verify
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}`);
    
    console.log('\n🎉 Done! Now:');
    console.log('1. Refresh your browser');
    console.log('2. Products should appear on home page');
    console.log('3. Images should load from Unsplash');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

console.log('📥 Importing Sample Products with Images...\n');
importProducts();
