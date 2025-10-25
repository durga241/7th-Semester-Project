const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

const productStore = new Map(); // Fallback in-memory storage

// Upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  if (!file) return null;
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('⚠️ Cloudinary not configured');
    return null;
  }

  try {
    console.log('📤 Uploading image to Cloudinary...');
    const base64String = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64String}`;
    
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'farmconnect/products',
      resource_type: 'auto'
    });
    
    console.log('✅ Image uploaded to Cloudinary');
    return uploadResult.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    return null;
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    console.log('🔍 [CREATE PRODUCT] Request user:', {
      uid: req.user.uid,
      role: req.user.role,
      email: req.user.email
    });
    
    if (req.user.role !== 'farmer') {
      console.error(`❌ [CREATE PRODUCT] Access denied - User role is '${req.user.role}', expected 'farmer'`);
      return res.status(403).json({ 
        ok: false, 
        error: 'Only farmers can create products',
        currentRole: req.user.role,
        expectedRole: 'farmer'
      });
    }

    // Get or create user
    let user = await User.findById(req.user.uid);
    if (!user) {
      console.log(`⚠️ User not found, creating new user for ${req.user.email}`);
      user = await User.create({
        email: req.user.email,
        name: req.user.email.split('@')[0],
        role: req.user.role,
        phone: ''
      });
    }

    // Handle image upload
    let imageUrl = '';
    
    // Priority 1: File upload (Multer)
    if (req.file) {
      // Use relative path for serving via Express static
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('✅ Image uploaded:', imageUrl);
    }
    // Priority 2: Direct URL from form
    else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
      console.log('✅ Image URL provided:', imageUrl);
    }
    // Priority 3: Try Cloudinary (if configured)
    else if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      imageUrl = await uploadImageToCloudinary(req.file);
      console.log('✅ Image uploaded to Cloudinary:', imageUrl);
    }

    // Create product
    const product = await Product.create({
      title: req.body.title,
      description: req.body.description || '',
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      category: req.body.category,
      farmerId: user._id,
      imageUrl,
      status: req.body.status || 'available',
      visibility: req.body.visibility || 'visible',
      discount: req.body.discount ? Number(req.body.discount) : 0
    });
    
    console.log(`✅ Product created: ${product.title}`);
    res.json({ ok: true, product });
  } catch (err) {
    console.error('❌ Create product error:', err);
    res.status(500).json({ ok: false, error: 'Failed to create product: ' + err.message });
  }
};

// Get all products (with pagination and filtering)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const query = { visibility: 'visible' };
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .populate('farmerId', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({ ok: true, products, total });
  } catch (err) {
    console.error('❌ Get products error:', err);
    res.json({ ok: true, products: [], total: 0 });
  }
};

// Get products by farmer
exports.getProductsByFarmer = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.params.id })
      .populate('farmerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, products });
  } catch (err) {
    console.error('❌ Get farmer products error:', err);
    res.json({ ok: true, products: [] });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }
    
    if (String(product.farmerId) !== req.user.uid) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    // Handle image upload if provided
    if (req.file) {
      const imageUrl = await uploadImageToCloudinary(req.file);
      if (imageUrl) {
        product.imageUrl = imageUrl;
      }
    }

    // Update fields
    const updateFields = ['title', 'description', 'price', 'quantity', 'category', 'imageUrl', 'status', 'visibility', 'discount'];
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = field === 'discount' ? Number(req.body[field]) : req.body[field];
      }
    });
    
    await product.save();
    console.log(`✅ Product updated: ${product.title}`);
    
    res.json({ ok: true, product });
  } catch (err) {
    console.error('❌ Update product error:', err);
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }
    
    if (String(product.farmerId) !== req.user.uid) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    
    await product.deleteOne();
    console.log(`✅ Product deleted: ${product.title}`);
    
    res.json({ ok: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Delete product error:', err);
    res.status(500).json({ ok: false, error: 'Delete failed' });
  }
};

// Toggle product status
exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['available', 'unavailable', 'out_of_stock'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }
    
    if (String(product.farmerId) !== req.user.uid) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    
    product.status = status;
    await product.save();
    
    console.log(`✅ Product status updated: ${product.title} -> ${status}`);
    res.json({ ok: true, product });
  } catch (err) {
    console.error('❌ Toggle status error:', err);
    res.status(500).json({ ok: false, error: 'Status update failed' });
  }
};

// Toggle product visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;
    
    if (!visibility || !['visible', 'hidden'].includes(visibility)) {
      return res.status(400).json({ ok: false, error: 'Invalid visibility' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }
    
    if (String(product.farmerId) !== req.user.uid) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    
    product.visibility = visibility;
    product.status = visibility === 'visible' ? 'available' : 'unavailable';
    await product.save();
    
    console.log(`✅ Product visibility and status updated: ${product.title} -> ${visibility} / ${product.status}`);
    res.json({ ok: true, product });
  } catch (err) {
    console.error('❌ Toggle visibility error:', err);
    console.error('❌ Full error stack:', err.stack);
    res.status(500).json({ ok: false, error: 'Visibility update failed: ' + err.message });
  }
};
