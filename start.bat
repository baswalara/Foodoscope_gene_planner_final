@echo off
:: ==============================================================================
:: GENEEATS LAUNCHER — Windows
:: ==============================================================================
:: Usage: Double-click start.bat  OR  run it in Command Prompt
::
:: On first run: auto-creates .venv and installs dependencies
:: On every run: frees ports 8000/8001, starts backend + frontend, opens browser
:: ==============================================================================

title GeneEats Launcher
cd /d "%~dp0"

:: 1. AUTO-SETUP VIRTUAL ENVIRONMENT
if not exist ".venv\Scripts\activate.bat" (
    echo [..] No virtual environment found -- creating one...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        echo         Make sure Python 3 is installed and on your PATH.
        pause
        exit /b 1
    )
    echo    [OK] .venv created

    echo [..] Installing dependencies from backend\requirements.txt...
    .venv\Scripts\pip install --quiet -r backend\requirements.txt
    if errorlevel 1 (
        echo [ERROR] pip install failed. Check backend\requirements.txt.
        pause
        exit /b 1
    )
    echo    [OK] Dependencies installed
)

:: 2. ACTIVATE VIRTUAL ENVIRONMENT
call .venv\Scripts\activate.bat
echo [OK] Virtual Environment Ready

:: 2. FREE PORTS (kill any process on 8000 or 8001 from a previous session)
echo [..] Checking ports 8000 ^& 8001...
for %%P in (8000 8001) do (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        echo    [!] Port %%P in use (PID %%i) -- freeing it...
        taskkill /PID %%i /F >nul 2>&1
    )
)
echo    [OK] Ports are clear

:: 3. START BACKEND (Port 8000)
echo [..] Starting Backend on Port 8000...
start /b "" uvicorn backend.server:app --reload --port 8000 > nul 2>&1

:: Give backend a moment to boot
timeout /t 3 /nobreak > nul

:: Check if port 8000 is listening
netstat -ano | findstr ":8000" | findstr "LISTENING" > nul
if %errorlevel% neq 0 (
    echo [ERROR] Backend failed to start. Check that all requirements are installed.
    pause
    exit /b 1
)
echo [OK] Backend running on http://localhost:8000

:: 3. START FRONTEND (Port 8001)
echo [..] Starting Frontend on Port 8001...
start /b "" python -m http.server 8001 --directory frontend > nul 2>&1

:: Short pause so the HTTP server is ready before browser opens
timeout /t 1 /nobreak > nul

:: 4. OPEN BROWSER
echo [..] Launching Browser...
start http://localhost:8001

echo.
echo  App is running!
echo    Frontend : http://localhost:8001
echo    Backend  : http://localhost:8000
echo.
echo  Press Ctrl+C (or close this window) to stop all servers.
echo.

:: 5. KEEP WINDOW OPEN — Ctrl+C or closing the window will end the script.
::    Servers started with "start /b" will keep running after this script ends.
::    To kill them cleanly, close this window and run:  taskkill /f /im python.exe
pause > nul
