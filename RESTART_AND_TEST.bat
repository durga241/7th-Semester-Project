@echo off
echo ========================================
echo   RESTARTING SERVER WITH FIXED ROUTES
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe 2>nul
echo Done!
echo.

echo Step 2: Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Step 3: Starting server...
cd server
start "FarmConnect Server - FIXED" cmd /k "node index.js"

echo.
echo ========================================
echo IMPORTANT: Look for these messages
echo in the new server window:
echo.
echo "🔧 Registering authentication routes FIRST..."
echo "✅ Direct auth routes registered"
echo "🚀 Server running on http://localhost:3001"
echo ========================================
echo.

echo Step 4: Waiting 5 seconds for server to start...
timeout /t 5 /nobreak >nul

echo Step 5: Testing server...
echo.
curl -s http://localhost:3001/api/health
echo.
echo.

echo ========================================
echo If you see JSON above with "routes" array, 
echo the server is working!
echo.
echo Now try signup in your browser at:
echo http://localhost:5173
echo ========================================
pause
