@echo off
echo ==============================
echo   闲人天气 - 一键安装依赖
echo ==============================
echo.
echo 正在安装项目依赖，请耐心等待...
echo （大约需要 2-5 分钟）
echo.
npm install --registry=https://registry.npmmirror.com
echo.
if %errorlevel%==0 (
    echo ==============================
    echo   ✅ 依赖安装完成！
    echo   现在可以用 VS Code 打开项目了
    echo ==============================
) else (
    echo ==============================
    echo   ❌ 安装失败，请截图发给小白
    echo ==============================
)
pause
