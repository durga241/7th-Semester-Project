@echo off
title Complete Customer Flow - Login to Dashboard
color 0B

echo.
echo ================================================================
echo   🎨 COMPLETE CUSTOMER FLOW - NEW DESIGN
echo ================================================================
echo.
echo Testing the complete customer experience:
echo   ✅ Beautiful login page (green-to-blue gradient)
echo   ✅ Clean, modern dashboard
echo   ✅ Product browsing with filters
echo   ✅ Shopping cart functionality
echo   ✅ Checkout process
echo   ✅ Responsive design
echo.
echo ================================================================
echo.

REM Kill existing Node processes
echo [1/4] Stopping existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Done!
echo.

REM Start Backend Server
echo [2/4] Starting Backend Server...
cd server
start "FarmConnect Backend" cmd /k "echo ================================ && echo BACKEND SERVER && echo ================================ && echo. && node index.js"
cd ..
timeout /t 4 /nobreak >nul
echo ✅ Backend started on http://localhost:3001
echo.

REM Start Frontend
echo [3/4] Starting Frontend...
start "FarmConnect Frontend" cmd /k "echo ================================ && echo FRONTEND SERVER && echo ================================ && echo. && npm run dev"
timeout /t 6 /nobreak >nul
echo ✅ Frontend started on http://localhost:5173
echo.

REM Test Backend Health
echo [4/4] Testing Backend Health...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is responding!
) else (
    echo ⚠️ Backend may not be ready yet. Wait 5 more seconds...
    timeout /t 5 /nobreak >nul
)
echo.

timeout /t 2 /nobreak >nul
start http://localhost:5173/customer/login
echo ✅ Customer Login page opened
echo.

echo ================================================================
echo   📋 COMPLETE CUSTOMER FLOW TEST
echo ================================================================
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 1: Customer Login Page                                  ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo You should see:
echo   ✅ "CUSTOMER CONNECT" logo with green-to-blue gradient
echo   ✅ Leaf icon in gradient box
echo   ✅ "Customer Login" heading
echo   ✅ Clean white card with shadow
echo   ✅ Email and password fields with icons
echo   ✅ Show/hide password toggle (eye icon)
echo   ✅ Green-to-blue gradient login button
echo   ✅ "Forgot Password?" link
echo   ✅ "New here? Create an account" link
echo.
echo 🔵 TEST: Create Account First
echo    ────────────────────────────────────────────────────────────
echo    1. Click "Create an account"
echo    2. Fill in:
echo       - Name: Test Customer
echo       - Email: customer@test.com
echo       - Password: test123
echo       - Role: Customer
echo    3. Click "Sign Up"
echo    4. Return to login page
echo.
echo 🔵 TEST: Login
echo    ────────────────────────────────────────────────────────────
echo    1. Enter: customer@test.com
echo    2. Enter: test123
echo    3. Click eye icon to verify password visibility toggle
echo    4. Click "Login" button
echo    5. ✅ Should see loading spinner
echo    6. ✅ Should see success toast
echo    7. ✅ Should redirect to /customer/dashboard
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 2: Customer Dashboard                                   ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo You should see:
echo   ✅ Header with "CUSTOMER CONNECT" logo (green-to-blue gradient)
echo   ✅ "Fresh from Farm to Table" tagline
echo   ✅ Shopping cart icon with item count
echo   ✅ User name displayed
echo   ✅ Logout button
echo   ✅ "Welcome back, Test Customer!" heading
echo   ✅ Search bar with icon
echo   ✅ Category filter dropdown
echo   ✅ Price range filter dropdown
echo   ✅ Product grid with cards
echo.
echo Product Cards should have:
echo   ✅ Product image or emoji
echo   ✅ "Fresh" badge (green-to-blue gradient)
echo   ✅ Heart icon (wishlist)
echo   ✅ Product name and category
echo   ✅ Rating with stars
echo   ✅ Location with map pin icon
echo   ✅ Price in large bold text
echo   ✅ Stock availability
echo   ✅ "Add to Cart" button (green-to-blue gradient)
echo   ✅ Hover effect: Card shadow increases
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 3: Product Browsing                                     ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔵 TEST: Search
echo    ────────────────────────────────────────────────────────────
echo    1. Type in search bar (e.g., "tomato")
echo    2. ✅ Products should filter in real-time
echo    3. Clear search
echo    4. ✅ All products should show again
echo.
echo 🔵 TEST: Category Filter
echo    ────────────────────────────────────────────────────────────
echo    1. Click "Category" dropdown
echo    2. Select "Vegetables"
echo    3. ✅ Only vegetables should display
echo    4. Select "All Categories"
echo    5. ✅ All products should show
echo.
echo 🔵 TEST: Price Filter
echo    ────────────────────────────────────────────────────────────
echo    1. Click "Price Range" dropdown
echo    2. Select "Under ₹50"
echo    3. ✅ Only products under ₹50 should show
echo    4. Try other price ranges
echo    5. ✅ Filtering should work correctly
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 4: Shopping Cart                                        ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔵 TEST: Add to Cart
echo    ────────────────────────────────────────────────────────────
echo    1. Click "Add to Cart" on any product
echo    2. ✅ Should see success toast: "[Product] added to cart!"
echo    3. ✅ Cart icon should show item count (1)
echo    4. ✅ Button should change to quantity controls
echo    5. Click + button
echo    6. ✅ Quantity should increase
echo    7. Click - button
echo    8. ✅ Quantity should decrease
echo    9. Add multiple different products
echo    10. ✅ Cart count should update
echo.
echo 🔵 TEST: View Cart
echo    ────────────────────────────────────────────────────────────
echo    1. Click shopping cart icon (top right)
echo    2. ✅ Cart modal should slide up/appear
echo    3. ✅ Should show all cart items
echo.
echo Cart Modal should have:
echo   ✅ "Shopping Cart" heading
echo   ✅ Close button (X)
echo   ✅ List of cart items with:
echo      - Product image
echo      - Product name
echo      - Price per unit
echo      - Quantity controls (+/-)
echo      - Remove button (X)
echo   ✅ Total price (green-to-blue gradient text)
echo   ✅ "Checkout" button (green-to-blue gradient)
echo.
echo 🔵 TEST: Cart Controls
echo    ────────────────────────────────────────────────────────────
echo    1. In cart modal, click + on an item
echo    2. ✅ Quantity should increase
echo    3. ✅ Total should update
echo    4. Click - on an item
echo    5. ✅ Quantity should decrease
echo    6. ✅ Total should update
echo    7. Click X (remove) on an item
echo    8. ✅ Item should be removed
echo    9. ✅ Success toast should show
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 5: Checkout                                             ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔵 TEST: Checkout Process
echo    ────────────────────────────────────────────────────────────
echo    1. Add items to cart
echo    2. Open cart modal
echo    3. Click "Checkout" button
echo    4. ✅ Should see success toast: "Order placed successfully!"
echo    5. ✅ Cart should be cleared
echo    6. ✅ Cart modal should close
echo    7. ✅ Cart icon should show 0 items
echo.
echo 🔵 TEST: Empty Cart Checkout
echo    ────────────────────────────────────────────────────────────
echo    1. Clear all items from cart
echo    2. Click "Checkout"
echo    3. ✅ Should see error: "Your cart is empty!"
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 6: Responsive Design                                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔵 TEST: Mobile View
echo    ────────────────────────────────────────────────────────────
echo    1. Resize browser to mobile width (^< 768px)
echo    2. ✅ Logo should show
echo    3. ✅ Menu icon (hamburger) should appear
echo    4. ✅ Desktop menu should hide
echo    5. Click menu icon
echo    6. ✅ Mobile menu should slide down
echo    7. ✅ Cart, Profile, Logout options visible
echo    8. ✅ Product grid should be 1 column
echo.
echo 🔵 TEST: Tablet View
echo    ────────────────────────────────────────────────────────────
echo    1. Resize to tablet width (768px - 1024px)
echo    2. ✅ Product grid should be 2 columns
echo    3. ✅ Desktop header should show
echo    4. ✅ All filters should fit properly
echo.
echo 🔵 TEST: Desktop View
echo    ────────────────────────────────────────────────────────────
echo    1. Resize to desktop width (^> 1024px)
echo    2. ✅ Product grid should be 3-4 columns
echo    3. ✅ Hover effects should work
echo    4. ✅ All elements should be visible
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  STEP 7: User Actions                                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 🔵 TEST: Logout
echo    ────────────────────────────────────────────────────────────
echo    1. Click "Logout" button
echo    2. ✅ Should see success toast: "Logged out successfully!"
echo    3. ✅ Should redirect to /customer/login
echo    4. ✅ All session data should be cleared
echo    5. Try to access /customer/dashboard directly
echo    6. ✅ Should redirect to login (protected route)
echo.
echo.
echo ================================================================
echo   🎨 DESIGN CHECKLIST
echo ================================================================
echo.
echo Login Page:
echo   [ ] Clean white card centered on screen
echo   [ ] Green-to-blue gradient logo and button
echo   [ ] Leaf icon in gradient box
echo   [ ] Password show/hide toggle
echo   [ ] Smooth hover effects
echo   [ ] Responsive on all devices
echo.
echo Dashboard Header:
echo   [ ] Sticky header at top
echo   [ ] Green-to-blue gradient logo
echo   [ ] Cart icon with count badge
echo   [ ] User name displayed
echo   [ ] Logout button
echo   [ ] Mobile menu for small screens
echo.
echo Product Cards:
echo   [ ] Clean white background
echo   [ ] Gradient product image background
echo   [ ] "Fresh" badge with gradient
echo   [ ] Heart icon for wishlist
echo   [ ] Rating with stars
echo   [ ] Location with map pin
echo   [ ] Large bold price
echo   [ ] Green-to-blue gradient "Add to Cart" button
echo   [ ] Hover: Shadow increases
echo   [ ] Quantity controls when in cart
echo.
echo Search ^& Filters:
echo   [ ] White card background
echo   [ ] Search with icon
echo   [ ] Category dropdown
echo   [ ] Price range dropdown
echo   [ ] Real-time filtering
echo.
echo Shopping Cart Modal:
echo   [ ] Centered modal (desktop)
echo   [ ] Slide up from bottom (mobile)
echo   [ ] Cart items with images
echo   [ ] Quantity controls
echo   [ ] Remove buttons
echo   [ ] Total price in gradient text
echo   [ ] Green-to-blue checkout button
echo   [ ] Empty state with icon
echo.
echo ================================================================
echo   ✅ SUCCESS CRITERIA
echo ================================================================
echo.
echo Complete Flow Working:
echo   [ ] Can create customer account
echo   [ ] Can login successfully
echo   [ ] Dashboard loads with products
echo   [ ] Can search products
echo   [ ] Can filter by category
echo   [ ] Can filter by price
echo   [ ] Can add products to cart
echo   [ ] Cart icon updates with count
echo   [ ] Can view cart modal
echo   [ ] Can update quantities in cart
echo   [ ] Can remove items from cart
echo   [ ] Can checkout successfully
echo   [ ] Can logout
echo   [ ] Protected routes work
echo.
echo Design Quality:
echo   [ ] Consistent green-to-blue gradient theme
echo   [ ] Clean, minimal, modern design
echo   [ ] Smooth animations and transitions
echo   [ ] Professional typography
echo   [ ] Responsive on all screen sizes
echo   [ ] Good contrast and readability
echo   [ ] Intuitive user interface
echo.
echo ================================================================
echo.
echo Both servers are running in separate windows.
echo Test the complete customer flow now!
echo.
echo 📖 For design details, see: CUSTOMER_DASHBOARD_DESIGN.md
echo.
pause
