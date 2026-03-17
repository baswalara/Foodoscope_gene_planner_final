@echo off
:: ==============================================================================
:: FOODOSCOPE LAUNCHER — Windows
:: ==============================================================================
:: Usage: Double-click start.bat  OR  run it in Command Prompt
::
:: 1. Activates Virtual Environment
:: 2. Starts Backend Server  (Port 8000)
:: 3. Starts Frontend Server (Port 8001)
:: ==============================================================================

title GeneEats Launcher
cd /d "%~dp0"

:: 1. ACTIVATE VIRTUAL ENVIRONMENT
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo [ERROR] Virtual environment not found.
    echo Run:  python -m venv .venv
    echo Then: .venv\Scripts\pip install -r backend\requirements.txt
    pause
    exit /b 1
)

echo [OK] Virtual Environment Activated

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
