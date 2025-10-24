@echo off
echo Testing Signup API...
echo.

curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test123@example.com\",\"password\":\"password123\",\"role\":\"farmer\"}"

echo.
echo.
echo If you see "ok":true above, the API works!
echo If you see 404, restart the server.
echo.
pause
