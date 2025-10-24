@echo off
echo ========================================
echo  Signup Flow Fix - Complete Solution
echo ========================================
echo.
echo This will:
echo   1. Clear test users from database
echo   2. Restart the server
echo   3. Show you how to test the complete flow
echo.
pause
echo.

echo [1/3] Clearing test users from database...
cd server
node clear-test-users.js
echo.
echo ========================================
pause
echo.

echo [2/3] Stopping old server processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Starting server...
start cmd /k "node index.js"
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo  COMPLETE SIGNUP FLOW - How to Test
echo ========================================
echo.
echo Step 1: Go to Signup Page
echo   - Open: http://localhost:5173/signup
echo   - Fill in: Name, Email, Password
echo   - Click: "Create Account"
echo.
echo Step 2: What Should Happen
echo   SUCCESS:
echo     ✅ Toast: "Registration successful!"
echo     ✅ Automatically redirects to /login page (1 sec delay)
echo.
echo   ERROR - Email Already Registered:
echo     ❌ Toast: "Email already registered. Please login instead"
echo     ✅ Auto-redirects to login page (2 sec delay)
echo     OR click "Go to Login" button in toast
echo.
echo Step 3: Login Page
echo   - Enter your email and password
echo   - Click "Login"
echo.
echo Step 4: What Should Happen
echo   SUCCESS:
echo     ✅ Toast: "Login successful! Welcome back!"
echo     ✅ Redirects to dashboard/home page
echo     ✅ You are now logged in
echo.
echo ========================================
echo  TESTING TIPS
echo ========================================
echo.
echo TIP 1: Use Different Emails
echo   - First signup: yourname@example.com
echo   - Second signup: Use a DIFFERENT email
echo   - This prevents "already registered" errors
echo.
echo TIP 2: Check Browser Console (F12)
echo   - Shows detailed logs from authService.ts
echo   - Helps diagnose any issues
echo.
echo TIP 3: Check Server Terminal
echo   - Shows MongoDB connection status
echo   - Shows signup/login requests
echo   - Shows detailed error messages
echo.
echo TIP 4: If Email Already Exists
echo   - Just login with that email
echo   - OR run this script again to clear test users
echo.
echo ========================================
echo  WHAT WAS FIXED
echo ========================================
echo.
echo ✅ Signup now shows success message
echo ✅ Auto-redirects to login after signup
echo ✅ Login redirects to dashboard after success
echo ✅ Better error handling for duplicate emails
echo ✅ Auto-redirect to login if email exists
echo.
echo Server is running! Start testing now.
echo ========================================
pause
