const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected');
  
  const result = await mongoose.connection.db.collection('products').updateMany(
    { discount: { $exists: false } },
    { $set: { discount: '' } }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} products`);
  
  // Verify
  const sample = await mongoose.connection.db.collection('products').findOne({ title: 'Broccoli' });
  console.log('Broccoli discount:', sample?.discount);
  
  process.exit(0);
}).catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
