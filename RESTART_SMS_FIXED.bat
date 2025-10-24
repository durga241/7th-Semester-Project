@echo off
echo.
echo ========================================
echo   📱 SMS FIXED - RESTART SERVER
echo ========================================
echo.
echo ✅ FIXED:
echo    1. Phone number leading zero handling
echo    2. Email notification function
echo.
echo 🛑 Stopping Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo ✅ Processes stopped
echo.
echo 🚀 Starting server with fixes...
echo.
cd server
start "BACKEND - SMS WORKING" cmd /k "node index.js"

timeout /t 3 >nul

echo.
echo ========================================
echo   ✅ SERVER RESTARTED!
echo ========================================
echo.
echo 📱 Your phone numbers will now work:
echo    - 07569294090 (leading zero) ✅
echo    - +917569294090 (country code) ✅
echo    - 7569294090 (plain 10 digits) ✅
echo.
echo 🧪 TEST NOW:
echo    1. Login as Farmer
echo    2. Update order status to "Shipped"
echo    3. Watch server console
echo.
echo Expected Output:
echo   📱 Removed leading zero: 7569294090
echo   ✅ Phone number cleaned successfully: 7569294090
echo   ✅ SMS sent successfully to 7569294090
echo   📧 Email notification sent
echo.
pause
