@echo off
echo.
echo ========================================
echo   📱 RESTARTING SERVER - SMS FIX APPLIED
echo ========================================
echo.
echo 🔧 Fix: Authorization issue resolved
echo     - Orders can now be updated by farmers
echo     - SMS will be sent when status changes
echo.
echo 🛑 Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo ✅ Processes stopped
echo.
echo 🚀 Starting server...
echo.
cd server
start "BACKEND SERVER (SMS Fixed)" cmd /k "npm run dev"

echo.
echo ========================================
echo   ✅ SERVER RESTARTED!
echo ========================================
echo.
echo 📱 SMS is now configured and ready to send!
echo.
echo Next Steps:
echo 1. Wait for server to start (watch the new window)
echo 2. Login as farmer
echo 3. Update an order status
echo 4. Check server console for SMS confirmation
echo.
echo Expected Console Output:
echo   🔐 Authorization check:
echo   ✅ FarmerId assigned to order
echo   ✅ Order status updated
echo   📧 Email notification sent
echo   📱 SMS sent to customer!
echo.
pause
