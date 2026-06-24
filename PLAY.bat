@echo off
title PLAY BILINGUAL FLAG EXPLORER
echo ===================================================
echo   STARTING BILINGUAL FLAG EXPLORER FOR YOUR CHILD
echo ===================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python detected. Launching local web server...
    start "" http://localhost:8000/stitch_bilingual_flag_explorer/
    python -m http.server 8000
    goto end
)

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js detected. Launching local web server...
    start "" http://localhost:8000/stitch_bilingual_flag_explorer/
    npx http-server -p 8000
    goto end
)

:: Fallback: Open index.html directly (file:// protocol)
echo [Warning] No local server environment detected. 
echo Opening the app directly in your browser...
start "" "stitch_bilingual_flag_explorer\index.html"

:end
pause
