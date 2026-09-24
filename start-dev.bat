@echo off
echo Starting Fresh Tokri - Full Stack Development Environment
echo ============================================================
echo.
echo [1/3] Starting Backend (Node.js on port 5000)...
start "Fresh Tokri Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 2 /nobreak > nul

echo [2/3] Starting Frontend (React on port 3000)...
start "Fresh Tokri Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 2 /nobreak > nul

echo [3/3] Starting Admin Panel (React on port 3002)...
start "Fresh Tokri Admin" cmd /k "cd /d %~dp0admin && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ============================================================
echo All 3 services are starting up!
echo.
echo   Customer App  -> http://localhost:3000
echo   Admin Panel   -> http://localhost:3002
echo   Backend API   -> http://localhost:5000/api/health
echo.
echo IMPORTANT: Start backend first, wait for "MongoDB Connected", then use the apps.
echo ============================================================
pause

