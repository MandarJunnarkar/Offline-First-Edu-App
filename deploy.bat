@echo off
echo 🚀 Deploying Offline-First Educational App...
echo.

echo 📦 Building the app...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

echo 🌐 Choose deployment option:
echo 1. Vercel (Recommended - Free)
echo 2. Netlify (Free)
echo 3. Just build (no deploy)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Deploying to Vercel...
    echo Installing Vercel CLI...
    call npm install -g vercel
    echo.
    echo Deploying...
    call vercel --prod
) else if "%choice%"=="2" (
    echo.
    echo 🌐 Deploying to Netlify...
    echo Installing Netlify CLI...
    call npm install -g netlify-cli
    echo.
    echo Deploying...
    call netlify deploy --prod --dir=dist
) else if "%choice%"=="3" (
    echo.
    echo 📁 App built successfully in 'dist' folder
    echo You can manually upload this folder to any hosting service
) else (
    echo ❌ Invalid choice
)

echo.
echo 🎉 Done!
pause 