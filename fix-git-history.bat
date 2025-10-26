@echo off
echo ========================================
echo FIXING GIT HISTORY - REMOVING SECRETS
echo ========================================
echo.
echo This will remove the commit with Twilio secrets
echo and create a clean history.
echo.

cd /d "%~dp0"

echo Step 1: Reset to origin/main (before secrets)...
git reset --soft origin/main

echo.
echo Step 2: Creating clean commit with all changes...
git add -A

echo.
echo Step 3: Committing with clean history...
git commit -m "Update project: SMS integration and cleanup"

echo.
echo Step 4: Force pushing to GitHub...
git push origin main --force

echo.
echo ========================================
echo DONE! Clean history pushed to GitHub
echo ========================================
pause
