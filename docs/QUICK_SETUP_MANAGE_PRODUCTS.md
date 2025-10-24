# 🚀 Quick Setup Guide - Manage Products & Orders

## Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)
- Razorpay account (for payments)
- Cloudinary account (optional, for image uploads)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment Variables

Create/update `.env` file in the root directory:

```env
# Razorpay (Get from: https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Cloudinary (Optional - Get from: https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect

# JWT Secret
JWT_SECRET=your_secret_key_here

# SMTP (for OTP)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 4: Access the Application
- Open browser: `http://localhost:5173`
- Login as Farmer (use OTP authentication)
- Navigate to Products section

---

## 🎯 Testing the Features

### Test Product Management

1. **Add a Product**:
   - Click "Add Product" button
   - Fill in details
   - Upload image or enter URL
   - Submit

2. **Edit Product**:
   - Click "Edit" on any product
   - Modify details
   - Upload new image
   - Save changes

3. **Toggle Status**:
   - Click "Mark Out of Stock" button
   - Verify badge changes to red
   - Click "Mark Available" to restore

4. **Toggle Visibility**:
   - Click "Hide from Customers"
   - Verify badge shows "Hidden"
   - Product won't appear in marketplace

5. **Delete Product**:
   - Click "Delete" button
   - Confirm deletion
   - Product removed

### Test Order Flow

1. **Place Test Order**:
   - Click "Order This Product" button
   - Fill shipping details:
     - Name: Test User
     - Phone: 9876543210
     - Address: Test Address
     - City: Mumbai
     - State: Maharashtra
     - Pincode: 400001
   - Select quantity
   - Click "Proceed to Payment"

2. **Complete Payment** (Test Mode):
   - Razorpay modal opens
   - Use test card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Complete payment

3. **Verify Order**:
   - Success message appears
   - Check MongoDB for order entry
   - Order linked to farmer and customer

---

## 🔑 Getting API Keys

### Razorpay (Required for Orders)

1. Go to: https://dashboard.razorpay.com/signup
2. Sign up for free account
3. Navigate to Settings → API Keys
4. Generate Test Keys
5. Copy `Key ID` and `Key Secret`
6. Add to `.env` file

**Test Mode**: No real money transactions, perfect for development

### Cloudinary (Optional for Image Uploads)

1. Go to: https://cloudinary.com/users/register/free
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Add to `.env` file

**Alternative**: Use direct image URLs if you don't want to set up Cloudinary

---

## 📊 Verify Database

### Check MongoDB Collections

```bash
# Connect to MongoDB
mongosh

# Switch to database
use farmconnect

# View products
db.products.find().pretty()

# View orders
db.orders.find().pretty()

# View users
db.users.find().pretty()
```

### Expected Collections:
- `products` - All products with status and visibility
- `orders` - Orders with payment info and shipping details
- `users` - Farmers and customers
- `otps` - OTP verification codes

---

## 🎨 UI Features Overview

### Farmer Dashboard - Manage Products

**Product Card Shows:**
- Product image
- Title and category
- Price and stock quantity
- Status badge (Available/Out of Stock)
- Visibility badge (Visible/Hidden)
- Action buttons

**Action Buttons:**
- Toggle Status (Available ↔ Out of Stock)
- Toggle Visibility (Show ↔ Hide)
- Order This Product (test ordering)
- Edit (opens edit modal)
- Delete (with confirmation)

### Order Checkout Modal

**Displays:**
- Product details with image
- Quantity selector
- Shipping address form
- Order summary
- Total amount
- Razorpay payment button

---

## 🐛 Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution:**
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/farmconnect
```

### Issue: "Razorpay not defined"
**Solution:**
- Check if Razorpay script is loaded
- Verify RAZORPAY_KEY_ID in .env
- Check browser console for errors

### Issue: "Image upload failed"
**Solution:**
- Verify Cloudinary credentials
- Check file size (< 10MB)
- Use direct URL as fallback

### Issue: "Order not saving"
**Solution:**
- Check MongoDB connection
- Verify JWT token is valid
- Check server logs for errors

---

## 📱 Mobile Testing

The UI is fully responsive. Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

All features work seamlessly across devices.

---

## 🔒 Security Notes

### Production Checklist:
- [ ] Use production Razorpay keys
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Rate limit API endpoints
- [ ] Use environment variables (never commit .env)

---

## 📈 Next Steps

1. **Add More Features**:
   - Order history for farmers
   - Customer order tracking
   - Product reviews and ratings
   - Bulk product upload
   - Analytics dashboard

2. **Enhance UI**:
   - Add loading skeletons
   - Implement toast notifications
   - Add animations
   - Improve error messages

3. **Optimize**:
   - Add caching
   - Implement pagination
   - Optimize images
   - Add search functionality

---

## 🎉 You're All Set!

Your Manage Products section is ready with:
✅ Full CRUD operations
✅ Status & visibility management
✅ Razorpay payment integration
✅ MongoDB storage
✅ Professional UI

**Start managing products and processing orders!** 🌾

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Check browser console
3. Verify .env configuration
4. Review MongoDB connection
5. Test with Razorpay test mode

**Happy Coding!** 💻
