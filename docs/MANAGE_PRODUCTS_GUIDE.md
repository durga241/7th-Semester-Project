# 📦 Manage Products & Order System - Complete Guide

## Overview
This guide covers the complete **Manage Product Section** with full CRUD operations, status management, and Razorpay-integrated order functionality for the FarmConnect marketplace.

---

## 🎯 Features Implemented

### 1. **Manage Products Section** (Farmer Dashboard)

#### ✏️ Edit Product
- **Full Edit Modal** with image upload support
- Edit product details: name, price, quantity, category, description
- **Image Management**:
  - Upload new images via file input
  - Preview images before saving
  - Support for Cloudinary image URLs
  - Fallback to URL input if file upload not available
- Real-time validation
- Success/error notifications

#### ❌ Delete Product
- Confirmation dialog before deletion
- Permanent removal from database
- Automatic UI refresh after deletion
- Error handling with user feedback

#### 🔁 Status Management
- **Available / Out of Stock Toggle**:
  - Visual status badges (green for available, red for out of stock)
  - One-click toggle between states
  - Immediate database update
  - Real-time UI reflection
  
- **Show / Hide Visibility Toggle**:
  - Control product visibility to customers
  - Hidden products remain in farmer's inventory but not shown in marketplace
  - Visual indicators (blue for visible, gray for hidden)
  - One-click toggle functionality

### 2. **Order Button Functionality**

#### 🛒 Order Checkout Flow
- **Product Selection**: Click "Order This Product" button
- **Order Modal** with:
  - Product details display with image
  - Quantity selector (with stock validation)
  - Shipping address form (name, phone, address, city, state, pincode)
  - Order summary with total calculation
  - Real-time price updates

#### 💳 Razorpay Integration
- **Payment Gateway**: Secure Razorpay checkout
- **Order Creation**: Backend creates order with pending status
- **Payment Processing**:
  - Razorpay payment modal opens automatically
  - Multiple payment methods supported (UPI, Cards, Net Banking)
  - Payment verification via signature validation
- **Order Confirmation**: Status updates to "confirmed" after successful payment

#### 📊 Order Storage
- **MongoDB Collections**:
  - Orders stored in `orders` collection
  - Linked to both farmer and customer via ObjectId references
  - Product details embedded in order
  - Payment information tracked (Razorpay order ID, payment ID, signature)
  - Shipping address stored
  - Order status tracking (pending → confirmed → shipped → delivered)

---

## 📁 File Structure

### New Components Created

```
src/components/
├── ManageProducts.tsx          # Product management component with CRUD
├── OrderCheckout.tsx           # Order checkout with Razorpay integration
└── FarmerDashboard.tsx         # Updated with new components

src/services/
└── api.ts                      # Updated with new API functions

server/
├── index.js                    # Updated with image upload support
└── models/
    ├── Product.js              # Product schema with status/visibility
    └── Order.js                # Order schema with payment info
```

---

## 🔧 Backend API Endpoints

### Product Management

#### 1. **Update Product** (with Image Upload)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (FormData):
- title: string
- description: string
- price: number
- quantity: number
- category: string
- status: 'available' | 'out_of_stock'
- visibility: 'visible' | 'hidden'
- image: File (optional)
- imageUrl: string (optional)
```

#### 2. **Delete Product**
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

#### 3. **Toggle Product Status**
```http
PATCH /api/products/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "available" | "out_of_stock"
}
```

#### 4. **Toggle Product Visibility**
```http
PATCH /api/products/:id/visibility
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "visibility": "visible" | "hidden"
}
```

### Order Management

#### 5. **Create Payment Order**
```http
POST /api/orders/create-payment
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [
    {
      "productId": "string",
      "quantity": number,
      "price": number
    }
  ],
  "shippingAddress": {
    "name": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "phone": "string"
  }
}

Response:
{
  "ok": true,
  "order": { ... },
  "razorpayOrder": {
    "id": "order_xxx",
    "amount": 10000,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

#### 6. **Verify Payment**
```http
POST /api/orders/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "razorpayOrderId": "string",
  "razorpayPaymentId": "string",
  "razorpaySignature": "string"
}
```

#### 7. **Get Farmer Orders**
```http
GET /api/orders/farmer/:farmerId
Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

### Product Schema
```javascript
{
  title: String (required),
  description: String,
  price: Number (required),
  quantity: Number (required),
  category: String (required),
  farmerId: ObjectId (ref: 'User', required),
  imageUrl: String,
  status: String (enum: ['available', 'out_of_stock'], default: 'available'),
  visibility: String (enum: ['visible', 'hidden'], default: 'visible'),
  timestamps: true
}
```

### Order Schema
```javascript
{
  customerId: ObjectId (ref: 'User', required),
  farmerId: ObjectId (ref: 'User', required),
  products: [{
    productId: ObjectId (ref: 'Product', required),
    quantity: Number (required),
    price: Number (required)
  }],
  total: Number (required),
  status: String (enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending'),
  paymentInfo: {
    method: String (enum: ['razorpay', 'cod', 'upi'], default: 'razorpay'),
    transactionId: String,
    paymentStatus: String (enum: ['pending', 'completed', 'failed'], default: 'pending'),
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  shippingAddress: {
    name: String (required),
    address: String (required),
    city: String (required),
    state: String (required),
    pincode: String (required),
    phone: String (required)
  },
  timestamps: true
}
```

---

## 🎨 UI Components

### ManageProducts Component

**Props:**
```typescript
interface ManageProductsProps {
  products: Product[];
  onProductUpdate: () => void;
  onStatusMessage: (message: string) => void;
  onOrderProduct?: (product: Product) => void;
}
```

**Features:**
- Grid layout of product cards
- Visual status badges
- Action buttons for each product
- Edit modal with form validation
- Image upload with preview
- Real-time updates

### OrderCheckout Component

**Props:**
```typescript
interface OrderCheckoutProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
  onStatusMessage: (message: string) => void;
}
```

**Features:**
- Product details display
- Quantity selector with validation
- Shipping form with required fields
- Order summary with calculations
- Razorpay payment integration
- Loading states and error handling

---

## 🚀 Usage Guide

### For Farmers

#### Managing Products

1. **Navigate to Products Section**:
   - Click "Products" in the farmer dashboard
   - View all your products in a grid layout

2. **Edit a Product**:
   - Click "Edit" button on any product card
   - Modify details in the modal
   - Upload new image or enter URL
   - Click "Update Product"

3. **Delete a Product**:
   - Click "Delete" button
   - Confirm deletion in dialog
   - Product removed immediately

4. **Toggle Status**:
   - Click "Mark Out of Stock" to make unavailable
   - Click "Mark Available" to restore availability
   - Status updates instantly

5. **Toggle Visibility**:
   - Click "Hide from Customers" to hide product
   - Click "Show to Customers" to make visible
   - Hidden products remain in your inventory

6. **Test Ordering**:
   - Click "Order This Product" to test the order flow
   - Complete checkout to see the customer experience

### For Customers

#### Placing Orders

1. **Browse Products**:
   - View available products in marketplace
   - Only visible products are shown

2. **Select Product**:
   - Click "Order Now" button on product card
   - Order checkout modal opens

3. **Enter Details**:
   - Select quantity (validated against stock)
   - Fill shipping address form
   - Review order summary

4. **Complete Payment**:
   - Click "Proceed to Payment"
   - Razorpay modal opens
   - Choose payment method
   - Complete payment

5. **Order Confirmation**:
   - Success message displayed
   - Order stored in database
   - Farmer receives order notification

---

## 🔐 Environment Variables

Add these to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

---

## 📝 Testing Checklist

### Product Management
- [ ] Create new product
- [ ] Edit product details
- [ ] Upload product image
- [ ] Update product image
- [ ] Delete product
- [ ] Toggle status (Available ↔ Out of Stock)
- [ ] Toggle visibility (Visible ↔ Hidden)
- [ ] Verify hidden products don't show to customers

### Order Flow
- [ ] Click "Order This Product" button
- [ ] Fill shipping details
- [ ] Select quantity
- [ ] Verify order summary calculations
- [ ] Complete Razorpay payment
- [ ] Verify order stored in database
- [ ] Check order linked to farmer and customer
- [ ] Verify payment information saved

### Edge Cases
- [ ] Try ordering out-of-stock product
- [ ] Try ordering more than available quantity
- [ ] Cancel payment and verify order status
- [ ] Test with invalid shipping details
- [ ] Test image upload with large files
- [ ] Test with no Cloudinary configuration

---

## 🐛 Troubleshooting

### Common Issues

**1. Image Upload Not Working**
- Verify Cloudinary credentials in `.env`
- Check file size (max 10MB recommended)
- Ensure file type is image (jpg, png, gif, webp)
- Fallback: Use direct image URL

**2. Payment Failing**
- Verify Razorpay credentials
- Use test card: 4111 1111 1111 1111
- Check network connectivity
- Verify signature validation

**3. Orders Not Saving**
- Check MongoDB connection
- Verify JWT token is valid
- Check user authentication
- Review server logs

**4. Status/Visibility Not Updating**
- Verify user is product owner
- Check authorization token
- Refresh page if needed
- Check network requests in DevTools

---

## 🎯 Key Features Summary

✅ **Full CRUD Operations** - Create, Read, Update, Delete products
✅ **Image Management** - Upload and update product images
✅ **Status Control** - Available/Out of Stock toggle
✅ **Visibility Control** - Show/Hide from customers
✅ **Order System** - Complete checkout flow
✅ **Razorpay Integration** - Secure payment processing
✅ **Database Storage** - MongoDB with proper relationships
✅ **Real-time Updates** - Instant UI reflection
✅ **Error Handling** - User-friendly error messages
✅ **Responsive Design** - Works on all devices

---

## 📚 Additional Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Cloudinary Documentation**: https://cloudinary.com/documentation
- **MongoDB Documentation**: https://docs.mongodb.com/
- **React Hook Form**: https://react-hook-form.com/

---

## 🎉 Success!

Your Manage Product section is now fully functional with:
- Complete product management
- Order processing with Razorpay
- Database integration
- Professional UI/UX

**Happy Farming! 🌾**
