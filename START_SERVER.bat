@echo off
echo ========================================
echo   FARMCONNECT - BACKEND SERVER STARTUP
echo ========================================
echo.

cd server

echo [1/3] Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo [3/3] Starting server...
echo.
echo ========================================
echo   Server will start on port 3001
echo   Press Ctrl+C to stop
echo ========================================
echo.

node index.js

pause
