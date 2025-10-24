@echo off
echo ========================================
echo   FRESH START - KILLING ALL AND RESTARTING
echo ========================================
echo.

echo Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe 2>nul
echo Done!
echo.

echo Step 2: Waiting 3 seconds...
timeout /t 3 /nobreak >nul
echo.

echo Step 3: Starting SIMPLE server...
echo.
cd server
start "FarmConnect Simple Server" cmd /k "node simple-server.js"

echo.
echo ========================================
echo A new window should open with the server running.
echo Look for: "Simple Server Running!"
echo ========================================
echo.

timeout /t 2 /nobreak >nul

echo Step 4: Testing if server is responding...
echo.
curl -s http://localhost:3001
echo.
echo.

echo ========================================
echo If you see JSON above, server is running!
echo Now try signup in your browser.
echo ========================================
pause
