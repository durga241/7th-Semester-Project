@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
cd server
start "FarmConnect Backend" cmd /k "node index.js"

echo.
echo Server restart initiated!
echo Check the server window for logs.
pause
