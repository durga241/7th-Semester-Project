@echo off
echo ========================================
echo   RESTART SERVER TO SEE DETAILED ERROR
echo ========================================
echo.

echo Killing old server...
taskkill /F /IM node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

echo Starting server with detailed logging...
cd server
node index.js

pause
