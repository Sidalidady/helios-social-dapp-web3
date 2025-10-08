@echo off
echo Cleaning up old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json
echo.
echo Installing dependencies with --force flag...
call npm install --force
echo.
echo Installation complete!
pause
