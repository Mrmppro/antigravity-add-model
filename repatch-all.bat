@echo off
echo Applying Antigravity + Antigravity IDE patch (All-in-One)...
cd /d "%~dp0"
call npm run build
powershell -ExecutionPolicy Bypass -File ".\deploy.ps1"
echo.
echo All patches applied successfully!
pause
