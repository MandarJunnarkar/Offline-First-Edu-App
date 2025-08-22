# 🚀 Vercel Deployment Guide

## Prerequisites
- Make sure you have a `.env` file in your project root with all required environment variables
- Ensure you're using the latest version of Vercel CLI

## Environment Variables Setup

### 1. Create `.env` file in project root:
```bash
VITE_SUPABASE_URL=https://irdkopcaaefscqqqennq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGtvcGNhYWVmc2NxcXFlbm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTU3OTUsImV4cCI6MjA3MTQ3MTc5NX0.4eXhKwK1ib6ArwzaS7V8gt-vZFzCzJzr_-ld0a9bOq0

# Note: Firebase has been removed from this project
# The app now uses only Supabase for backend services
```

### 2. Set Environment Variables in Vercel:
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# Add other variables as needed
```

## Deployment Steps

### Option 1: Vercel CLI (Recommended)
```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push

## Troubleshooting

### If you get PWA build errors:
- ✅ Custom `sw.js` file has been removed
- ✅ Conflicting workbox dependency removed
- ✅ PWA configuration simplified

### If you get environment variable errors:
- ✅ Check that `.env` file exists in project root
- ✅ Verify Supabase variables are set in Vercel dashboard
- ✅ Restart deployment after setting environment variables

### Build Command
The build command should be: `npm run build`

## Post-Deployment
After successful deployment:
1. Test your app functionality
2. Verify offline capabilities work
3. Check that Supabase connections work
4. Test PWA installation on mobile devices
