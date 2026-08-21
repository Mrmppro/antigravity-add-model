@echo off
echo Applying Antigravity IDE patch...
cd /d "%~dp0"
call npm run build
powershell -ExecutionPolicy Bypass -File ".\deploy-ide.ps1"
echo.
echo Antigravity IDE patch applied successfully!
pause
