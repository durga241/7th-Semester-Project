@echo off
echo ========================================
echo   STARTING SIMPLE SERVER
echo ========================================
echo.
echo This is a minimal server that WILL work!
echo.
echo Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul

timeout /t 2 /nobreak >nul

echo.
echo Starting simple server...
cd server
node simple-server.js

pause
