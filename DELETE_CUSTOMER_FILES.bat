@echo off
title Delete Customer Login Files
color 0C

echo.
echo ================================================================
echo   DELETE ALL CUSTOMER LOGIN FILES
echo ================================================================
echo.
echo This will delete all customer-related files that were created.
echo.
echo WARNING: This action cannot be undone!
echo.
pause

echo.
echo Deleting files...
echo.

REM Delete source code files
echo [1/2] Deleting source code files...
del /F /Q "src\components\CustomerDashboard.tsx" 2>nul
if exist "src\components\CustomerDashboard.tsx" (
    echo   X Failed to delete src\components\CustomerDashboard.tsx
) else (
    echo   ✓ Deleted src\components\CustomerDashboard.tsx
)

del /F /Q "src\pages\CustomerDashboard.tsx" 2>nul
if exist "src\pages\CustomerDashboard.tsx" (
    echo   X Failed to delete src\pages\CustomerDashboard.tsx
) else (
    echo   ✓ Deleted src\pages\CustomerDashboard.tsx
)

del /F /Q "src\pages\CustomerDashboardNew.tsx" 2>nul
if exist "src\pages\CustomerDashboardNew.tsx" (
    echo   X Failed to delete src\pages\CustomerDashboardNew.tsx
) else (
    echo   ✓ Deleted src\pages\CustomerDashboardNew.tsx
)

del /F /Q "src\pages\CustomerLogin.tsx" 2>nul
if exist "src\pages\CustomerLogin.tsx" (
    echo   X Failed to delete src\pages\CustomerLogin.tsx
) else (
    echo   ✓ Deleted src\pages\CustomerLogin.tsx
)

echo.
echo [2/2] Deleting documentation files...

del /F /Q "COMPLETE_CUSTOMER_REDESIGN.md" 2>nul
if exist "COMPLETE_CUSTOMER_REDESIGN.md" (
    echo   X Failed to delete COMPLETE_CUSTOMER_REDESIGN.md
) else (
    echo   ✓ Deleted COMPLETE_CUSTOMER_REDESIGN.md
)

del /F /Q "CUSTOMER_DASHBOARD_DESIGN.md" 2>nul
if exist "CUSTOMER_DASHBOARD_DESIGN.md" (
    echo   X Failed to delete CUSTOMER_DASHBOARD_DESIGN.md
) else (
    echo   ✓ Deleted CUSTOMER_DASHBOARD_DESIGN.md
)

del /F /Q "CUSTOMER_FARMER_LOGIN_SYSTEM.md" 2>nul
if exist "CUSTOMER_FARMER_LOGIN_SYSTEM.md" (
    echo   X Failed to delete CUSTOMER_FARMER_LOGIN_SYSTEM.md
) else (
    echo   ✓ Deleted CUSTOMER_FARMER_LOGIN_SYSTEM.md
)

del /F /Q "CUSTOMER_LOGIN_DESIGN.md" 2>nul
if exist "CUSTOMER_LOGIN_DESIGN.md" (
    echo   X Failed to delete CUSTOMER_LOGIN_DESIGN.md
) else (
    echo   ✓ Deleted CUSTOMER_LOGIN_DESIGN.md
)

del /F /Q "CUSTOMER_LOGIN_FLOW_DIAGRAM.md" 2>nul
if exist "CUSTOMER_LOGIN_FLOW_DIAGRAM.md" (
    echo   X Failed to delete CUSTOMER_LOGIN_FLOW_DIAGRAM.md
) else (
    echo   ✓ Deleted CUSTOMER_LOGIN_FLOW_DIAGRAM.md
)

del /F /Q "TEST_COMPLETE_CUSTOMER_FLOW.bat" 2>nul
if exist "TEST_COMPLETE_CUSTOMER_FLOW.bat" (
    echo   X Failed to delete TEST_COMPLETE_CUSTOMER_FLOW.bat
) else (
    echo   ✓ Deleted TEST_COMPLETE_CUSTOMER_FLOW.bat
)

del /F /Q "TEST_CUSTOMER_AND_FARMER_LOGIN.bat" 2>nul
if exist "TEST_CUSTOMER_AND_FARMER_LOGIN.bat" (
    echo   X Failed to delete TEST_CUSTOMER_AND_FARMER_LOGIN.bat
) else (
    echo   ✓ Deleted TEST_CUSTOMER_AND_FARMER_LOGIN.bat
)

del /F /Q "TEST_CUSTOMER_LOGIN_COMPLETE.md" 2>nul
if exist "TEST_CUSTOMER_LOGIN_COMPLETE.md" (
    echo   X Failed to delete TEST_CUSTOMER_LOGIN_COMPLETE.md
) else (
    echo   ✓ Deleted TEST_CUSTOMER_LOGIN_COMPLETE.md
)

del /F /Q "TEST_CUSTOMER_LOGIN_FLOW.bat" 2>nul
if exist "TEST_CUSTOMER_LOGIN_FLOW.bat" (
    echo   X Failed to delete TEST_CUSTOMER_LOGIN_FLOW.bat
) else (
    echo   ✓ Deleted TEST_CUSTOMER_LOGIN_FLOW.bat
)

echo.
echo ================================================================
echo   DELETION COMPLETE
echo ================================================================
echo.
echo All customer-related files have been removed.
echo.
echo App.tsx has been updated to remove customer routes.
echo.
echo Remaining routes:
echo   - /login (generic login)
echo   - /farmer/login (farmer login)
echo   - /signup (signup)
echo   - /farmer/dashboard (farmer dashboard)
echo.
pause
