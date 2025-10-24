const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// All order routes require authentication
router.post('/create-payment', auth, orderController.createPayment);
router.post('/verify-payment', auth, orderController.verifyPayment);
router.get('/customer', auth, orderController.getCustomerOrders);
router.get('/farmer/:farmerId', orderController.getFarmerOrders);
router.patch('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
