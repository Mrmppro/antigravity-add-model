@echo off
echo Applying Antigravity (Standalone App) patch...
cd /d "%~dp0"
call npm run build
powershell -ExecutionPolicy Bypass -File ".\deploy-antigravity.ps1"
echo.
echo Antigravity Standalone patch applied successfully!
pause
