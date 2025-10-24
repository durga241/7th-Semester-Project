@echo off
title Complete Login Flow Test - Customer & Farmer
color 0B

echo.
echo ================================================================
echo   🔐 COMPLETE LOGIN FLOW TEST - CUSTOMER ^& FARMER
echo ================================================================
echo.
echo This will test the complete authentication flow:
echo   ✅ Customer Signup ^> Login ^> Dashboard
echo   ✅ Farmer Signup ^> Login ^> Dashboard
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

REM Open Browser
timeout /t 2 /nobreak >nul
start http://localhost:5173/login
echo ✅ Browser opened to login page!
echo.

echo ================================================================
echo   📋 TEST INSTRUCTIONS
echo ================================================================
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  🛒 CUSTOMER LOGIN FLOW                                       ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 1️⃣  CREATE CUSTOMER ACCOUNT
echo    ────────────────────────────────────────────────────────────
echo    • Click "New User? Sign Up"
echo    • Fill in:
echo      - Name: Test Customer
echo      - Email: customer@test.com
echo      - Password: test123
echo      - Role: ● Customer (selected by default)
echo    • Click "Sign Up"
echo    • ✅ Should show: "Registration successful. Please login."
echo.
echo 2️⃣  LOGIN AS CUSTOMER
echo    ────────────────────────────────────────────────────────────
echo    • Enter credentials:
echo      - Email: customer@test.com
echo      - Password: test123
echo    • Click "Login"
echo    • ✅ Should redirect to: /customer/dashboard
echo.
echo 3️⃣  VERIFY CUSTOMER DASHBOARD
echo    ────────────────────────────────────────────────────────────
echo    ✅ Page shows: "Welcome, Test Customer! 🛒"
echo    ✅ Top bar shows: "Customer Dashboard"
echo    ✅ Has search and filter options
echo    ✅ Shows product grid from database
echo    ✅ "Add to Cart" buttons work
echo    ✅ Shopping cart icon in header
echo    ✅ "Logout" button works
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  🌾 FARMER LOGIN FLOW                                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 4️⃣  CREATE FARMER ACCOUNT
echo    ────────────────────────────────────────────────────────────
echo    • Logout from customer account
echo    • Go to: http://localhost:5173/signup
echo    • Fill in:
echo      - Name: Test Farmer
echo      - Email: farmer@test.com
echo      - Password: test123
echo      - Role: ○ Farmer (select this)
echo    • Click "Sign Up"
echo    • ✅ Should show: "Registration successful. Please login."
echo.
echo 5️⃣  LOGIN AS FARMER
echo    ────────────────────────────────────────────────────────────
echo    • Enter credentials:
echo      - Email: farmer@test.com
echo      - Password: test123
echo    • Click "Login"
echo    • ✅ Should redirect to: /farmer/dashboard
echo.
echo 6️⃣  VERIFY FARMER DASHBOARD
echo    ────────────────────────────────────────────────────────────
echo    ✅ Page shows: "Welcome, Test Farmer"
echo    ✅ Top bar shows: "Farmer Dashboard"
echo    ✅ Has sidebar: Overview, Products, Inventory, etc.
echo    ✅ Can add new products
echo    ✅ Can view/edit existing products
echo    ✅ Can see orders and earnings
echo    ✅ "Logout" button works
echo.
echo.
echo ================================================================
echo   🔍 VERIFICATION CHECKLIST
echo ================================================================
echo.
echo Backend Console (check the Backend window):
echo   ✅ "MongoDB connected successfully"
echo   ✅ "Direct auth routes registered"
echo   ✅ "Signup request received: customer@test.com"
echo   ✅ "Login request received: customer@test.com"
echo   ✅ "Signup request received: farmer@test.com"
echo   ✅ "Login request received: farmer@test.com"
echo.
echo Browser Console (F12 ^> Console):
echo   ✅ No red errors
echo   ✅ "[AUTH] Login response: {ok: true, ...}"
echo   ✅ Navigation to correct dashboard
echo.
echo Browser LocalStorage (F12 ^> Application ^> Local Storage):
echo   After Customer Login:
echo     • fc_jwt: [token]
echo     • farmconnect_userName: Test Customer
echo     • farmconnect_userRole: customer
echo.
echo   After Farmer Login:
echo     • fc_jwt: [token]
echo     • farmconnect_userName: Test Farmer
echo     • farmconnect_userRole: farmer
echo.
echo ================================================================
echo   🎯 KEY DIFFERENCES
echo ================================================================
echo.
echo CUSTOMER DASHBOARD:
echo   • Shopping-focused interface
echo   • Browse and filter products
echo   • Add to cart functionality
echo   • Shopping cart modal
echo   • Checkout process
echo   • Order history
echo.
echo FARMER DASHBOARD:
echo   • Management-focused interface
echo   • Add/Edit/Delete products
echo   • Inventory management
echo   • View customer orders
echo   • Earnings analytics
echo   • Communication with customers
echo.
echo ================================================================
echo   ❌ TROUBLESHOOTING
echo ================================================================
echo.
echo Problem: "404 - Not Found" error
echo   Solution: Backend may not be ready. Wait 10 seconds and retry
echo.
echo Problem: "Invalid credentials"
echo   Solution: Create account first via Signup
echo.
echo Problem: Login successful but stays on login page
echo   Solution: Check browser console (F12) for navigation errors
echo.
echo Problem: Dashboard not showing correctly
echo   Solution 1: Check user role in localStorage
echo   Solution 2: Hard refresh: Ctrl + Shift + R
echo.
echo Problem: Products not loading
echo   Solution 1: Check MongoDB connection (backend console)
echo   Solution 2: Add products via farmer dashboard first
echo.
echo ================================================================
echo.
echo Both servers are running in separate windows.
echo Keep this window open to see instructions.
echo.
echo 📖 Detailed documentation: TEST_CUSTOMER_LOGIN_COMPLETE.md
echo.
pause
