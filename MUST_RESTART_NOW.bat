@echo off
echo ========================================
echo RESTARTING SERVER - PLEASE WAIT
echo ========================================
echo.

echo Killing existing Node processes...
taskkill /F /IM node.exe /T >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo Starting server in new window...
cd server
start "FarmConnect Server" cmd /k "node index.js"

echo.
echo ========================================
echo SERVER RESTARTED!
echo ========================================
echo Check the new terminal window for:
echo  - MongoDB connected successfully
echo  - SMS service: Configured
echo.
echo Now refresh your browser and test!
echo ========================================
pause
