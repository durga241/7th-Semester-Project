# Quick Test Guide - New Features

## 🚀 How to Test the 3 New Features

---

## Setup

1. **Start Backend Server:**
```bash
cd server
npm start
```

2. **Start Frontend:**
```bash
npm run dev
```

3. **Open Two Browser Windows:**
   - Window 1: Farmer Dashboard
   - Window 2: Customer View (or use incognito)

---

## Test 1: Hide Unavailable Products (2 minutes)

### Steps:

1. **Login as Farmer** (Window 1)
   - Go to farmer dashboard
   - Navigate to "My Products" section

2. **Mark Product as Unavailable**
   - Find any product
   - Click the eye icon or "Mark as Unavailable" button
   - Should see alert: "Product is now HIDDEN from customer home page"

3. **Check Customer View** (Window 2)
   - Go to customer home page
   - The product should NOT appear in the product grid
   - Only available products show

4. **Mark as Available Again** (Window 1)
   - Click the eye icon again
   - Product status changes to "Available"

5. **Verify Customer View** (Window 2)
   - Refresh customer home page
   - Product should now appear again

✅ **Pass:** Unavailable products don't show to customers  
❌ **Fail:** Unavailable products still visible

---

## Test 2: Order Notifications with Sound (3 minutes)

### Steps:

1. **Login as Farmer** (Window 1)
   - Keep farmer dashboard open
   - Make sure speakers/volume is ON 🔊
   - Watch the bell icon in top-right corner

2. **Place Order as Customer** (Window 2)
   - Login as customer (or use incognito)
   - Browse products
   - Add product to cart
   - Complete checkout and place order

3. **Wait and Listen** (Window 1)
   - Wait 10-15 seconds
   - Should hear **BEEP sound** 🔔
   - Bell icon should show red badge with number
   - Notification panel should auto-open

4. **Check Notification Content**
   - Title: "New Order Received!"
   - Message: "You have X new order(s) from customers"
   - Time: "Just now"
   - Green shopping cart icon

5. **Navigate to Orders**
   - Click "Orders / Requests" in sidebar
   - New order should appear in list
   - Order status: "Pending"

✅ **Pass:** Sound plays + notification shows + order appears  
❌ **Fail:** No sound or notification

**Troubleshooting:**
- If no sound: Check browser audio permissions
- If no notification: Check browser console for errors
- Polling interval: 10 seconds (be patient!)

---

## Test 3: Product Discount Badge (2 minutes)

### Steps:

1. **Login as Farmer** (Window 1)
   - Go to "My Products"
   - Click "Add New Product" or edit existing

2. **Add Product with Discount**
   - Fill in product details:
     - Name: "Fresh Tomatoes"
     - Price: ₹50
     - Quantity: 100
     - **Discount: 25** ← IMPORTANT!
   - Save product

3. **Check Farmer Dashboard**
   - Product should show discount in listing
   - Verify discount value saved

4. **View Customer Home Page** (Window 2)
   - Go to customer home/browse products
   - Find the product you just added

5. **Check Discount Badge**
   - **Left side of image**: Red badge
   - Text: "25% OFF"
   - Badge should **pulse/animate**
   - Badge positioned above heart icon

6. **Test Different Discounts**
   - Edit product, set discount to 0
   - Save and check customer view
   - Badge should NOT show (0% = no badge)
   
   - Edit again, set discount to 100
   - Save and check customer view
   - Badge shows "100% OFF"

✅ **Pass:** Badge shows on left, correct percentage, animates  
❌ **Fail:** No badge, wrong position, or wrong percentage

**Visual Check:**
- Badge color: Red (#ef4444)
- Badge position: Top-left corner
- Badge text: White, bold
- Badge size: Compact, not too large
- Animation: Subtle pulse

---

## Quick Visual Reference

### Product Card Layout:
```
┌─────────────────────────┐
│  [25% OFF]       [₹50]  │ ← Discount left, Price right
│                          │
│        🍅               │
│      IMAGE              │
│         ❤️              │ ← Heart below discount
│                          │
└─────────────────────────┘
```

### Farmer Dashboard - Notification Bell:
```
┌──────────────────────────┐
│  [👤] Farmer    [🔔 (3)] │ ← Red badge with count
└──────────────────────────┘
```

---

## Expected Results Summary

| Feature | Farmer Action | Customer Result |
|---------|---------------|-----------------|
| **Hide Product** | Mark as unavailable | Product disappears from listings |
| **Notification** | Customer places order | Sound plays + notification shows |
| **Discount** | Add 25% discount | Red "25% OFF" badge on product |

---

## Troubleshooting

### Product Not Hiding:
1. Check product `visibility` field in MongoDB
2. Should be `'hidden'` when unavailable
3. Customer API should filter by `visibility: 'visible'`

### No Notification Sound:
1. Check browser allows audio autoplay
2. Open browser console, look for audio errors
3. Try clicking anywhere on page first (browser policy)

### Discount Not Showing:
1. Check product has `discount` > 0 in database
2. Verify frontend receives discount in API response
3. Check browser console for React errors

---

## Database Verification (Optional)

### Check Product in MongoDB:
```javascript
db.products.findOne({ title: "Fresh Tomatoes" })

// Should see:
{
  discount: 25,
  visibility: 'visible',
  status: 'available'
}
```

### Check Orders:
```javascript
db.orders.find().sort({ createdAt: -1 }).limit(1)

// Should see latest order
```

---

## Success Criteria ✅

All three features pass if:
- ✅ Unavailable products hidden from customers
- ✅ Notification sound plays on new order
- ✅ Discount badge shows correctly on products

---

## Time Estimate: 7 minutes total

- Test 1: 2 minutes
- Test 2: 3 minutes  
- Test 3: 2 minutes

---

**Need Help?**
- Check `FEATURE_UPDATES_SUMMARY.md` for detailed implementation
- Check browser console for error messages
- Verify MongoDB connection and data
