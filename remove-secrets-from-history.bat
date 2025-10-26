@echo off
echo ========================================
echo REMOVING SECRETS FROM GIT HISTORY
echo ========================================
echo.
echo WARNING: This will rewrite git history!
echo You'll need to force push after this.
echo.
pause

cd /d "%~dp0"

echo Removing sensitive files from history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch ORDER_SMS_IMPLEMENTATION_SUMMARY.md SETUP_TWILIO_SMS.bat SMS_NOT_RECEIVING_COMPLETE_CHECKLIST.md TWILIO_SMS_SETUP_COMPLETE.md" --prune-empty --tag-name-filter cat -- --all

echo.
echo Forcing garbage collection...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Now force push with:
echo git push origin main --force
echo.
pause
