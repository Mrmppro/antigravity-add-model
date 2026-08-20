@echo off
echo Applying Antigravity patch...
cd /d "%~dp0"
call npm run build
powershell -ExecutionPolicy Bypass -File ".\deploy.ps1"
echo.
echo Patch applied successfully!
pause
