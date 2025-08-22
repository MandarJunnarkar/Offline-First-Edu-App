@echo off
echo 🚀 Building Offline-First Educational App...
echo.

echo 📦 Installing dependencies...
npm install

echo 🔨 Building for production...
npm run build

echo.
echo ✅ Build completed successfully!
echo.
echo 🌐 To deploy to Vercel:
echo 1. Install Vercel CLI: npm install -g vercel
echo 2. Run: vercel --prod
echo.
echo 🌐 To deploy to Netlify:
echo 1. Install Netlify CLI: npm install -g netlify-cli
echo 2. Run: netlify deploy --prod --dir=dist
echo.
echo 📁 Your built app is in the 'dist' folder
echo.
pause 