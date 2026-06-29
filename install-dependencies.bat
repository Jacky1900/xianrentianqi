@echo off
chcp 65001 >nul
echo ==============================
echo   XianRenTianQi - Install Dependencies
echo ==============================
echo.
echo Installing dependencies, please wait...
echo (This may take 2-5 minutes)
echo.
npm install --registry=https://registry.npmmirror.com
echo.
if %errorlevel%==0 (
    echo ==============================
    echo   Done! Dependencies installed.
    echo   You can now open with VS Code.
    echo ==============================
) else (
    echo ==============================
    echo   Failed! Please check error.
    echo ==============================
)
pause
