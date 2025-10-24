@echo off
echo ========================================
echo   TESTING SIGNUP API
echo ========================================
echo.

echo Testing if server is running...
curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is NOT running!
    echo.
    echo Please start server first:
    echo   cd server
    echo   node index.js
    echo.
    pause
    exit /b 1
)

echo ✅ Server is running
echo.

echo Testing signup endpoint...
echo.

curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Test Farmer\",\"email\":\"test%random%@example.com\",\"password\":\"password123\",\"role\":\"farmer\"}"

echo.
echo.
echo ========================================
echo If you see "ok":true above, it works!
echo If you see 404, server needs restart
echo ========================================
pause
