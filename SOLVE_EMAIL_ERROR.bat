@echo off
title Email Already Registered - Quick Fix
color 0A

echo.
echo ========================================
echo   EMAIL ALREADY REGISTERED - FIX IT
echo ========================================
echo.
echo What do you want to do?
echo.
echo [1] Show which emails are registered
echo [2] Clear ALL test users (fresh start)
echo [3] Just tell me what email to use
echo [4] Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto check
if "%choice%"=="2" goto clear
if "%choice%"=="3" goto suggest
if "%choice%"=="4" goto end

:check
echo.
echo Checking database...
cd server
node check-users.js
pause
goto menu

:clear
echo.
echo Clearing test users from database...
cd server
node clear-test-users.js
echo.
echo ========================================
echo   ALL TEST USERS DELETED!
echo ========================================
echo.
echo Now you can use any email for signup.
echo Try: test@example.com
echo.
pause
goto end

:suggest
echo.
echo ========================================
echo   QUICK SOLUTION - USE THESE EMAILS
echo ========================================
echo.
echo Copy one of these emails for signup:
echo.
echo   test-%random%@example.com
echo   user-%random%@example.com
echo   demo-%random%@example.com
echo.
echo Or make your own:
echo   yourname-1@example.com
echo   yourname-2@example.com
echo   yourname-3@example.com
echo.
echo TIP: Just change the number each time!
echo.
echo ========================================
pause
goto end

:menu
echo.
echo What do you want to do?
echo.
echo [1] Show which emails are registered
echo [2] Clear ALL test users (fresh start)
echo [3] Just tell me what email to use
echo [4] Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto check
if "%choice%"=="2" goto clear
if "%choice%"=="3" goto suggest
if "%choice%"=="4" goto end
goto menu

:end
echo.
echo Goodbye!
timeout /t 2 /nobreak >nul
