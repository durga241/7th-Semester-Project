@echo off
echo.
echo ========================================
echo   📱 SMS DEBUG - RESTART SERVER
echo ========================================
echo.
echo 🛑 STEP 1: Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo ✅ All processes stopped
echo.
echo 🚀 STEP 2: Starting server with SMS fix...
echo.
cd server
start "BACKEND SERVER - SMS DEBUG" cmd /k "echo Starting server with SMS debugging... && npm run dev"

timeout /t 3 >nul

echo.
echo ========================================
echo   📋 TESTING CHECKLIST
echo ========================================
echo.
echo After server starts, you should see:
echo   ✅ MongoDB connected successfully
echo   ✅ Cloudinary configured
echo   ✅ Server running on port 3001
echo.
echo Then test SMS by:
echo.
echo 1. Login as FARMER
echo 2. Go to Orders section
echo 3. Update order status to "Packed"
echo.
echo ========================================
echo   🔍 WHAT TO LOOK FOR IN SERVER CONSOLE
echo ========================================
echo.
echo You MUST see these logs (in order):
echo.
echo   🔐 Authorization check:
echo     Order farmerId: null
echo     Logged-in user ID: [ID]
echo   ⚠️ Order has no farmerId, assigning...
echo   ✅ FarmerId assigned to order
echo   ✅ Authorization passed
echo   ✅ Order status updated: [ORDER_ID] -^> Packed
echo   📧 Email notification sent to [EMAIL]
echo   📱 Attempting to send SMS to [PHONE]...
echo   ✅ SMS sent to [PHONE]: Packed
echo.
echo ========================================
echo   ❌ IF YOU DON'T SEE THESE LOGS
echo ========================================
echo.
echo The server is NOT restarted properly!
echo Close ALL command windows and run this again.
echo.
pause
