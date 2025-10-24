@echo off
title Test New Customer & Farmer Login Pages
color 0B

echo.
echo ================================================================
echo   🎨 NEW LOGIN PAGES - CLEAN MINIMAL DESIGN
echo ================================================================
echo.
echo Testing the brand new Customer and Farmer login pages with:
echo   ✅ Clean, minimal, modern design
echo   ✅ Matching card layouts
echo   ✅ Beautiful gradients
echo   ✅ Password show/hide toggle
echo   ✅ Role-specific validation
echo   ✅ Smooth animations
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

echo ================================================================
echo   📋 TEST ROUTES - OPEN IN BROWSER
echo ================================================================
echo.
echo 🔵 Customer Login Page:
echo    http://localhost:5173/customer/login
echo.
echo 🟢 Farmer Login Page:
echo    http://localhost:5173/farmer/login
echo.
echo 🔶 General Login Page (redirects based on role):
echo    http://localhost:5173/login
echo.
timeout /t 2 /nobreak >nul

REM Open all three login pages
start http://localhost:5173/customer/login
timeout /t 1 /nobreak >nul
echo ✅ Customer Login page opened
echo.

echo ================================================================
echo   🎨 DESIGN FEATURES TO CHECK
echo ================================================================
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  Customer Login Page (/customer/login)                        ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Logo: "CUSTOMER CONNECT" with green-to-blue gradient
echo ✅ Leaf icon in gradient box (green-to-blue)
echo ✅ Heading: "Customer Login"
echo ✅ Subtitle: Welcome back message for customers
echo ✅ Email field with mail icon
echo ✅ Password field with lock icon
echo ✅ Show/Hide password toggle (eye icon)
echo ✅ "Forgot Password?" link (aligned right)
echo ✅ Login button: Green-to-blue gradient (#00B37E → #0077C0)
echo ✅ Rounded corners on all inputs and buttons
echo ✅ Hover effect: Button scales slightly larger
echo ✅ "New here? Create an account" link
echo ✅ "Are you a farmer? Login as Farmer" link at bottom
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  Farmer Login Page (/farmer/login)                            ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Logo: "FARMER CONNECT" with green gradient
echo ✅ Leaf icon in gradient box (green-to-emerald)
echo ✅ Heading: "Farmer Login"
echo ✅ Subtitle: Welcome back message for farmers
echo ✅ Email field with mail icon
echo ✅ Password field with lock icon
echo ✅ Show/Hide password toggle (eye icon)
echo ✅ "Forgot Password?" link (aligned right)
echo ✅ Login button: Green-to-emerald gradient
echo ✅ Rounded corners on all inputs and buttons
echo ✅ Hover effect: Button scales slightly larger
echo ✅ "New here? Create an account" link
echo ✅ "Are you a customer? Login as Customer" link at bottom
echo.
echo.
echo ================================================================
echo   🧪 FUNCTIONAL TESTS
echo ================================================================
echo.
echo 1️⃣  TEST CUSTOMER LOGIN
echo    ────────────────────────────────────────────────────────────
echo    • Go to: http://localhost:5173/customer/login
echo    • Create customer account first:
echo      - Go to http://localhost:5173/signup
echo      - Name: Test Customer
echo      - Email: customer@test.com
echo      - Password: test123
echo      - Role: Customer
echo    • Return to customer login page
echo    • Enter: customer@test.com / test123
echo    • Click "Login"
echo    • ✅ Should redirect to: /customer/dashboard
echo    • ✅ Should show welcome message
echo.
echo 2️⃣  TEST FARMER LOGIN
echo    ────────────────────────────────────────────────────────────
echo    • Go to: http://localhost:5173/farmer/login
echo    • Create farmer account:
echo      - Go to http://localhost:5173/signup
echo      - Name: Test Farmer
echo      - Email: farmer@test.com
echo      - Password: test123
echo      - Role: Farmer
echo    • Return to farmer login page
echo    • Enter: farmer@test.com / test123
echo    • Click "Login"
echo    • ✅ Should redirect to: /farmer/dashboard
echo    • ✅ Should show farmer dashboard
echo.
echo 3️⃣  TEST ROLE VALIDATION
echo    ────────────────────────────────────────────────────────────
echo    • Go to: http://localhost:5173/customer/login
echo    • Try to login with farmer credentials
echo    • ✅ Should show error: "This login is for customers only"
echo.
echo    • Go to: http://localhost:5173/farmer/login
echo    • Try to login with customer credentials
echo    • ✅ Should show error: "This login is for farmers only"
echo.
echo 4️⃣  TEST PASSWORD TOGGLE
echo    ────────────────────────────────────────────────────────────
echo    • Click the eye icon in password field
echo    • ✅ Password should become visible
echo    • Click again
echo    • ✅ Password should be hidden
echo.
echo 5️⃣  TEST VALIDATION
echo    ────────────────────────────────────────────────────────────
echo    • Try to submit empty form
echo    • ✅ Should show: "Please enter email and password"
echo.
echo    • Enter invalid email (e.g., "test")
echo    • ✅ Should show: "Please enter a valid email address"
echo.
echo    • Enter wrong password
echo    • ✅ Should show: "Invalid email or password"
echo.
echo 6️⃣  TEST NAVIGATION
echo    ────────────────────────────────────────────────────────────
echo    • Click "Forgot Password?" link
echo    • ✅ Should go to: /forgot-password
echo.
echo    • Click "Create an account" link
echo    • ✅ Should go to: /signup
echo.
echo    • Click "Login as Farmer" (from customer page)
echo    • ✅ Should go to: /farmer/login
echo.
echo    • Click "Login as Customer" (from farmer page)
echo    • ✅ Should go to: /customer/login
echo.
echo 7️⃣  TEST RESPONSIVE DESIGN
echo    ────────────────────────────────────────────────────────────
echo    • Resize browser window
echo    • ✅ Card should stay centered
echo    • ✅ On mobile: Padding should adjust
echo    • ✅ All text should be readable
echo.
echo 8️⃣  TEST HOVER EFFECTS
echo    ────────────────────────────────────────────────────────────
echo    • Hover over Login button
echo    • ✅ Gradient should get brighter
echo    • ✅ Button should scale up slightly (1.02x)
echo    • ✅ Shadow should get larger
echo.
echo    • Hover over links
echo    • ✅ Should show underline
echo    • ✅ Color should change
echo.
echo ================================================================
echo   🎨 DESIGN CHECKLIST
echo ================================================================
echo.
echo Card Design:
echo   [ ] White background
echo   [ ] Rounded corners (2xl)
echo   [ ] Subtle shadow
echo   [ ] Centered on screen
echo   [ ] Max width: 28rem
echo   [ ] Padding: 2rem (mobile) to 2.5rem (desktop)
echo.
echo Typography:
echo   [ ] Logo: 2xl, bold, gradient text
echo   [ ] Heading: 2xl, bold, gray-900
echo   [ ] Subtitle: sm, gray-600
echo   [ ] Labels: sm, medium, gray-700
echo   [ ] Links: sm, colored with hover underline
echo.
echo Colors:
echo   Customer:
echo   [ ] Logo gradient: green-500 to blue-600
echo   [ ] Button gradient: green-500 to blue-600
echo   [ ] Links: green-600
echo.
echo   Farmer:
echo   [ ] Logo gradient: green-700 to emerald-600
echo   [ ] Button gradient: green-600 to emerald-600
echo   [ ] Links: green-600
echo.
echo Form Fields:
echo   [ ] Height: 3rem (h-12)
echo   [ ] Icons: Left side (gray-400)
echo   [ ] Focus: Green ring
echo   [ ] Rounded: lg
echo   [ ] Password toggle: Right side
echo.
echo Buttons:
echo   [ ] Height: 3rem
echo   [ ] Full width
echo   [ ] Gradient background
echo   [ ] White text, semibold
echo   [ ] Rounded: lg
echo   [ ] Hover: Brighter gradient + scale
echo   [ ] Loading: Spinner animation
echo.
echo ================================================================
echo   📱 RESPONSIVE BREAKPOINTS
echo ================================================================
echo.
echo Mobile (320px - 640px):
echo   • Card: Full width with 1rem padding
echo   • Font sizes: Slightly smaller
echo   • Stack all elements vertically
echo.
echo Tablet (641px - 1024px):
echo   • Card: Max width 28rem
echo   • Standard font sizes
echo   • Centered layout
echo.
echo Desktop (1025px+):
echo   • Same as tablet
echo   • Larger padding (2.5rem)
echo   • Smooth hover transitions
echo.
echo ================================================================
echo.
echo Both servers are running in separate windows.
echo Test the new login pages now!
echo.
echo 📖 Documentation: See CUSTOMER_LOGIN_DESIGN.md for details
echo.
pause
