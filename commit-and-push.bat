@echo off
echo ========================================
echo COMMITTING AND PUSHING TO GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Committing changes...
git commit -m "cleanup: remove troubleshooting and debug files"

echo.
echo Step 2: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done!
echo ========================================
pause
