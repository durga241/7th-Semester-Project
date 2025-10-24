@echo off
echo ========================================
echo   TESTING SERVER CONNECTION
echo ========================================
echo.

echo 1. Testing if server is running...
curl -s http://localhost:3001
echo.
echo.

echo 2. Testing health endpoint...
curl -s http://localhost:3001/api/health
echo.
echo.

echo 3. Testing auth test endpoint...
curl -s http://localhost:3001/api/auth/test
echo.
echo.

echo 4. Testing signup endpoint...
curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"pass123\",\"role\":\"farmer\"}"
echo.
echo.

echo ========================================
echo If all tests show JSON responses, server is working!
echo If you see errors, server is not running properly.
echo ========================================
pause
