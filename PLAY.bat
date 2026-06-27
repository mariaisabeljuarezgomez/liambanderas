@echo off
title PLAY LIAM BANDERAS (Premium v2)
echo ===================================================
echo   LIAM BANDERAS - Bilingual Flag Explorer (v2)
echo   Mobile-first premium edition
echo ===================================================
echo.

:: Port check
netstat -an | find "LISTENING" | find ":8000" >nul 2>&1
if not errorlevel 1 (
    echo Port 8000 in use. Trying 8001...
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
    start "" http://localhost:%PORT%/app/
    goto end
)

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js detected. Launching local web server on port %PORT%...
    start "" npx --yes http-server -p %PORT%
    timeout /t 2 /nobreak >nul
    start "" http://localhost:%PORT%/app/
    goto end
)

:: Fallback: open v2 directly (works for this static app via file://)
echo [Warning] No local server detected. Opening v2 directly...
start "" "app\index.html"

:end
echo.
echo ---------------------------------------------------
echo   PREMIUM v2:  app\index.html   (NEW - mobile-first)
echo   ORIGINAL v1: stitch_bilingual_flag_explorer\
echo ---------------------------------------------------
pause
