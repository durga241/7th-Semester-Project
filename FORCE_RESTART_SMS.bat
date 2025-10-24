@echo off
echo.
echo ========================================
echo   🔄 FORCE RESTART - SMS FIX
echo ========================================
echo.
echo 🛑 Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo ✅ All Node processes killed
echo.
echo ⏳ Waiting 3 seconds for cleanup...
timeout /t 3 >nul

echo.
echo 🧹 Step 2: Clearing Node cache...
cd server
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1

echo ✅ Cache cleared
echo.
echo 🚀 Step 3: Starting fresh server...
echo.
start "BACKEND SERVER - FRESH START" cmd /k "echo === SERVER STARTING WITH SMS FIX === && echo. && node index.js"

timeout /t 2 >nul

echo.
echo ========================================
echo   ✅ SERVER RESTARTED SUCCESSFULLY!
echo ========================================
echo.
echo 📋 IMPORTANT: Look at the NEW server window
echo.
echo When you update order status, you MUST see:
echo.
echo   📱 Cleaning phone number: 07569294090 → 07569294090 (11 digits)
echo   📱 Removed leading zero: 7569294090
echo   ✅ Phone number cleaned successfully: 7569294090
echo   ✅ SMS sent successfully to 7569294090
echo.
echo If you DON'T see "Removed leading zero", the fix didn't load!
echo.
echo 🧪 TEST NOW:
echo   1. Login as Farmer
echo   2. Update order status
echo   3. Watch the SERVER WINDOW for the logs above
echo.
pause
