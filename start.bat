@echo off
echo ====================================
echo  SketchSpace Canvas - Quick Start
echo ====================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ====================================
echo  Installation complete!
echo ====================================
echo.
echo Starting development server...
echo Your browser will open automatically.
echo.
echo Press Ctrl+C to stop the server.
echo ====================================
echo.

call npm run dev

pause
