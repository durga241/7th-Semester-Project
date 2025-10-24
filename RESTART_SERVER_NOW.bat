@echo off
echo ========================================
echo   RESTARTING BACKEND SERVER
echo ========================================
echo.

echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul

timeout /t 2 /nobreak >nul

echo.
echo Starting server...
cd server
start cmd /k "node index.js"

echo.
echo ========================================
echo Server should be starting in new window
echo Check for: "Auth routes mounted"
echo ========================================
pause
