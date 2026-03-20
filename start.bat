@echo off
setlocal enabledelayedexpansion
title Community Guardian - Setup

echo.
echo   Community Guardian
echo   ==================
echo.

REM ─────────────────────────────────────────
REM  STEP 1 - Check Python
REM ─────────────────────────────────────────
echo [1/5] Checking Python...

python --version >nul 2>&1
if !errorlevel! == 0 (
    for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo   Found: %%v
    set PYTHON_CMD=python
    goto :check_node
)

python3 --version >nul 2>&1
if !errorlevel! == 0 (
    for /f "tokens=*" %%v in ('python3 --version 2^>^&1') do echo   Found: %%v
    set PYTHON_CMD=python3
    goto :check_node
)

echo.
echo   ERROR: Python not found.
echo   Install Python 3.9+ from https://python.org
echo   Make sure to check "Add Python to PATH" during install.
echo.
pause
exit /b 1

REM ─────────────────────────────────────────
REM  STEP 2 - Check Node.js
REM ─────────────────────────────────────────
:check_node
echo.
echo [2/5] Checking Node.js...

node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo   ERROR: Node.js not found.
    echo   Install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo   Found: %%v

REM ─────────────────────────────────────────
REM  STEP 3 - Python virtual environment
REM ─────────────────────────────────────────
echo.
echo [3/5] Setting up Python environment...

if not exist "backend\venv" (
    %PYTHON_CMD% -m venv backend\venv
    if !errorlevel! neq 0 (
        echo.
        echo   ERROR: Failed to create virtual environment.
        echo   Try running: python -m venv backend\venv
        echo.
        pause
        exit /b 1
    )
    echo   Created virtual environment
) else (
    echo   Virtual environment already exists
)

echo   Installing Python dependencies...
backend\venv\Scripts\pip install -q --upgrade pip >nul 2>&1
backend\venv\Scripts\pip install -q -r backend\requirements.txt
if !errorlevel! neq 0 (
    echo.
    echo   ERROR: Failed to install Python dependencies.
    echo   Check backend\requirements.txt exists and is valid.
    echo.
    pause
    exit /b 1
)
echo   Done

REM ─────────────────────────────────────────
REM  STEP 4 - Frontend dependencies
REM ─────────────────────────────────────────
echo.
echo [4/5] Installing frontend dependencies...

if not exist "frontend\node_modules" (
    cd frontend
    call npm install --silent
    if !errorlevel! neq 0 (
        echo.
        echo   ERROR: npm install failed.
        echo   Try running manually: cd frontend and npm install
        echo.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo   Done
) else (
    echo   Already installed
)

REM ─────────────────────────────────────────
REM  STEP 5 - Environment file
REM ─────────────────────────────────────────
echo.
echo [5/5] Checking environment config...

if not exist ".env" (
    echo.
    echo   Groq AI API key setup 
    echo   Get a free key at: console.groq.com
    echo   Press Enter to skip — app works without it.
    echo.
    set /p GROQ_KEY="  GROQ_API_KEY: "

    if "!GROQ_KEY!"=="" (
        echo GROQ_API_KEY=> .env
        echo   Skipped — app will use fallback rules
    ) else (
        echo GROQ_API_KEY=!GROQ_KEY!> .env
        echo   Key saved to .env
    )
) else (
    echo   .env already exists
)

REM ─────────────────────────────────────────
REM  LAUNCH BOTH SERVERS
REM ─────────────────────────────────────────
echo.
echo   Setup complete! Starting servers...
echo.
echo   Backend  --^>  http://localhost:8000
echo   API docs --^>  http://localhost:8000/docs
echo   Frontend --^>  http://localhost:5173
echo.
echo   Two terminal windows will open.
echo   Close them to stop the servers.
echo.
timeout /t 2 /nobreak >nul

REM Start backend in new window
start "Community Guardian - Backend" cmd /k "cd /d %~dp0backend && ..\backend\venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

REM Wait 3 seconds for backend to start before frontend
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Community Guardian - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo   Both servers starting in separate windows.
echo   Wait a few seconds then visit: http://localhost:5173
echo.
pause
