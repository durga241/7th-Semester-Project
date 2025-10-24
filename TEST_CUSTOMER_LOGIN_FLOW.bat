@echo off
title Customer Login Flow - Complete Test
color 0B

echo.
echo ============================================================
echo   🛒 CUSTOMER LOGIN FLOW - COMPLETE TEST
echo ============================================================
echo.
echo This script will help you test the complete customer journey:
echo   1. Start backend server
echo   2. Start frontend application  
echo   3. Guide you through the login flow
echo.
echo ============================================================
echo.

REM Kill existing Node processes
echo [1/5] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Done!
echo.

REM Start Backend Server
echo [2/5] Starting Backend Server...
cd server
start "FarmConnect Backend" cmd /k "echo ================================ && echo BACKEND SERVER && echo ================================ && echo. && node index.js"
cd ..
timeout /t 4 /nobreak >nul
echo ✅ Backend started on http://localhost:3001
echo.

REM Start Frontend
echo [3/5] Starting Frontend...
start "FarmConnect Frontend" cmd /k "echo ================================ && echo FRONTEND SERVER && echo ================================ && echo. && npm run dev"
timeout /t 6 /nobreak >nul
echo ✅ Frontend started on http://localhost:5173
echo.

REM Test Backend Health
echo [4/5] Testing Backend Health...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is responding!
) else (
    echo ⚠️ Backend may not be ready yet. Wait 5 more seconds...
    timeout /t 5 /nobreak >nul
)
echo.

REM Open Browser
echo [5/5] Opening Browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173/login
echo ✅ Browser opened to login page!
echo.

echo ============================================================
echo   📋 CUSTOMER LOGIN TEST STEPS
echo ============================================================
echo.
echo 🔵 STEP 1: CREATE CUSTOMER ACCOUNT (First Time)
echo    ────────────────────────────────────────────
echo    1. Click "New User? Sign Up"
echo    2. Fill in:
echo       - Name: Test Customer
echo       - Email: customer@test.com
echo       - Password: test123
echo       - Role: Customer (default)
echo    3. Click "Sign Up"
echo    4. Wait for: "Registration successful"
echo.
echo 🔵 STEP 2: LOGIN AS CUSTOMER
echo    ────────────────────────────────────────────
echo    1. Enter credentials:
echo       - Email: customer@test.com
echo       - Password: test123
echo    2. Click "Login"
echo    3. Wait for: "Login successful! Welcome back!"
echo.
echo 🔵 STEP 3: VERIFY DASHBOARD
echo    ────────────────────────────────────────────
echo    ✅ Check header shows: "Test Customer"
echo    ✅ Check products are loading
echo    ✅ Check category filters work
echo    ✅ Check "Add to Cart" works
echo    ✅ Check cart icon shows count
echo.
echo 🔵 STEP 4: TEST SHOPPING FEATURES
echo    ────────────────────────────────────────────
echo    1. Browse products by category
echo    2. Click "Add" on multiple products
echo    3. Click cart icon (top right)
echo    4. Review cart items
echo    5. Test checkout (optional)
echo.
echo 🔵 STEP 5: TEST USER DROPDOWN
echo    ────────────────────────────────────────────
echo    1. Click user icon (top right)
echo    2. Verify shows: "Test Customer"
echo    3. Verify shows: "customer@test.com"
echo    4. Click "My Shop" to see customer dashboard
echo    5. Test logout
echo.
echo ============================================================
echo   🔍 WHAT TO CHECK
echo ============================================================
echo.
echo Backend Console (separate window):
echo   ✅ "MongoDB connected successfully"
echo   ✅ "Direct auth routes registered"
echo   ✅ "Server running on http://localhost:3001"
echo   ✅ "Signup request received" (after signup)
echo   ✅ "Login request received" (after login)
echo.
echo Browser Console (F12):
echo   ✅ No red errors
echo   ✅ "[AUTH] Logging in with password: customer@test.com"
echo   ✅ "[AUTH] Login response: {ok: true, ...}"
echo.
echo Browser LocalStorage (F12 ^> Application ^> Local Storage):
echo   ✅ fc_jwt: [JWT token present]
echo   ✅ farmconnect_userName: Test Customer
echo   ✅ farmconnect_userEmail: customer@test.com
echo   ✅ farmconnect_userRole: customer
echo.
echo ============================================================
echo   ❌ TROUBLESHOOTING
echo ============================================================
echo.
echo Problem: Login shows 404 error
echo   Fix: Restart this script (backend may not be ready)
echo.
echo Problem: "Invalid credentials" error
echo   Fix: Create account first via "Sign Up" link
echo.
echo Problem: Products not loading
echo   Fix 1: Check MongoDB is connected (backend console)
echo   Fix 2: Add products via farmer dashboard first
echo.
echo Problem: Page not loading
echo   Fix: Check both windows are still running
echo.
echo ============================================================
echo.
echo 📖 Detailed guide: TEST_CUSTOMER_LOGIN_COMPLETE.md
echo.
echo Keep this window open to see instructions.
echo Both servers are running in separate windows.
echo.
pause
