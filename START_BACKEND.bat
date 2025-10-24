@echo off
echo ========================================
echo   Starting FarmConnect Backend Server
echo ========================================
echo.

cd server

echo Checking Node.js...
node --version
echo.

echo Starting server on port 3001...
echo.
echo Backend will be available at:
echo   http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node index.js

pause
