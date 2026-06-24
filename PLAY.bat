@echo off
title PLAY BILINGUAL FLAG EXPLORER
echo ===================================================
echo   STARTING BILINGUAL FLAG EXPLORER FOR YOUR CHILD
echo ===================================================
echo.

:: Port check
netstat -an | find "LISTENING" | find ":8000" >nul 2>&1
if not errorlevel 1 (
    echo Port 8000 is already in use. Trying 8001...
    SET PORT=8001
) else (
    SET PORT=8000
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python detected. Launching local web server on port %PORT%...
    start "" python -m http.server %PORT%
    timeout /t 2 /nobreak >nul
    start "" http://localhost:%PORT%/stitch_bilingual_flag_explorer/
    goto end
)

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js detected. Launching local web server on port %PORT%...
    start "" npx --yes http-server -p %PORT%
    timeout /t 2 /nobreak >nul
    start "" http://localhost:%PORT%/stitch_bilingual_flag_explorer/
    goto end
)

:: Fallback: Open index.html directly (file:// protocol)
echo [Warning] No local server environment detected. 
echo Opening the app directly in your browser...
start "" "stitch_bilingual_flag_explorer\index.html"

:end
pause
