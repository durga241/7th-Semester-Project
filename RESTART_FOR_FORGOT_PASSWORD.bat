@echo off
title Restart Server - Forgot Password Fix
color 0A

echo.
echo ========================================
echo   FORGOT PASSWORD - Route Fix Applied
echo ========================================
echo.
echo The missing routes have been added:
echo   - POST /api/auth/forgot-password
echo   - POST /api/auth/reset-password/:token
echo.
echo Restarting server to apply changes...
echo.

echo [1/2] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [2/2] Starting server...
cd server
start cmd /k "node index.js"
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo   SERVER RESTARTED!
echo ========================================
echo.
echo The "Forgot Password?" feature should now work.
echo.
echo HOW TO TEST:
echo ========================================
echo.
echo 1. Open your app: http://localhost:5173
echo.
echo 2. Click "Login" as Farmer
echo.
echo 3. Click "Forgot Password?" link
echo    (next to the Password field)
echo.
echo 4. Enter your registered email
echo.
echo 5. Click "Send Reset Link"
echo.
echo 6. You should see:
echo    ✅ "Email Sent! Check your inbox"
echo.
echo 7. Check your email for reset link
echo.
echo 8. Click link and set new password
echo.
echo ========================================
echo.
echo Server is running in a separate window.
echo Check that window for logs.
echo.
echo If email doesn't send, check server logs
echo for SMTP configuration errors.
echo.
pause
