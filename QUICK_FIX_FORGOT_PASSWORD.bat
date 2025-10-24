@echo off
echo ========================================
echo   FIXING FORGOT PASSWORD 404 ERROR
echo ========================================
echo.

echo [1/3] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!
echo.

echo [2/3] Starting fresh server...
cd server
start "FarmConnect Server" cmd /k "echo Starting FarmConnect Server... && node index.js"
cd ..
timeout /t 4 /nobreak >nul
echo.

echo [3/3] Testing forgot-password endpoint...
curl -X POST http://localhost:3001/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
echo.
echo.

echo ========================================
echo   RESTART COMPLETE!
echo ========================================
echo.
echo Server is now running in a separate window.
echo.
echo TEST THE FIX:
echo   1. Go to: http://localhost:5173
echo   2. Click "Forgot Password?"
echo   3. Enter your email
echo   4. Click "Send Reset Link"
echo.
echo If it still shows 404, check the server
echo window for any startup errors.
echo.
pause
