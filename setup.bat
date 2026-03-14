@echo off
echo ==========================================
echo    PHC Inventory System - Auto Setup
echo ==========================================

echo [1/4] Installing Server Dependencies...
cd server
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [2/4] Seeding Database...
call npm run seed
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [3/4] Installing Client Dependencies...
cd ../client
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo ==========================================
echo    Setup Complete!
echo    To run the app:
echo    1. cd server ^& npm start
echo    2. cd client ^& npm run dev
echo ==========================================
pause
