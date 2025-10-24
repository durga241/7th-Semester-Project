@echo off
echo ========================================
echo  RESTARTING FARMCONNECT SERVERS
echo ========================================
echo.

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Starting Backend Server...
start "FarmConnect Backend" cmd /k "cd server && node index.js"
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Frontend Server...
start "FarmConnect Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo  SERVERS STARTED!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Check the new terminal windows for logs
echo.
pause
