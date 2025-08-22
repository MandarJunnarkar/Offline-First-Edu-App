# 🔥 Firebase Setup for POC

## Step 1: Create Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Create a project"
3. Name it: `offline-first-edu-app`
4. Enable Google Analytics (optional)

## Step 2: Enable Firestore Database
1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for POC)
4. Select region closest to your users

## Step 3: Get Configuration
1. Project Settings → General
2. Scroll down to "Your apps"
3. Click "Add app" → Web
4. Copy the config object

## Step 4: Install Dependencies
```bash
npm install firebase
```

## Step 5: Add to Your App
Create `src/firebase.js` with your config and use it in ContentManager!

## Free Tier Limits:
- **Storage**: 1GB
- **Bandwidth**: 10GB/month  
- **Database**: 1GB
- **Perfect for POC!** 