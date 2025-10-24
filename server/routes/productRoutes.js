const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', productController.getProducts);
router.get('/farmer/:id', productController.getProductsByFarmer);

// Protected routes (require authentication)
router.post('/', auth, upload.single('image'), productController.createProduct);
router.put('/:id', auth, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.patch('/:id/status', auth, productController.toggleStatus);
router.patch('/:id/stock', auth, productController.toggleStatus); // Alias for stock toggle
router.patch('/:id/visibility', auth, productController.toggleVisibility);

module.exports = router;
