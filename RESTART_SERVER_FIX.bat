@echo off
echo ========================================
echo  Fixing Signup Error - Diagnostic Tool
echo ========================================
echo.

echo [1/4] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [2/4] Running diagnostic test...
echo This will test MongoDB connection and signup process
echo.
cd server
node test-signup.js
echo.
echo ========================================
pause
echo.

echo [3/4] Starting server...
start cmd /k "node index.js"
timeout /t 3 /nobreak >nul
echo.

echo [4/4] Done!
echo.
echo NEXT STEPS:
echo   1. Check the test results above
echo   2. If tests passed, try signup in the app
echo   3. If signup fails, check the server window for detailed errors
echo.
echo Server is running in a separate window.
echo Press Ctrl+C in that window to stop the server.
echo.
echo ========================================
pause
