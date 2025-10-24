@echo off
echo ========================================
echo   CHECKING WHAT'S RUNNING ON PORT 3001
echo ========================================
echo.

echo Testing root endpoint...
curl -s http://localhost:3001
echo.
echo.

echo Testing signup endpoint...
curl -s http://localhost:3001/api/auth/signup
echo.
echo.

echo ========================================
echo WHAT YOU SHOULD SEE:
echo Root: {"ok":true,"message":"FarmConnect API is running"}
echo Signup: {"ok":false,"error":"Name, email and password are required"}
echo.
echo WHAT YOU SHOULD NOT SEE:
echo - "Cannot GET /api/auth/signup" (wrong server running)
echo - Connection refused (server not running)
echo - 404 error (route not registered)
echo ========================================
pause
