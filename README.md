# 📚 Offline-First Educational App

A Progressive Web App (PWA) designed to deliver educational content to rural areas with unreliable internet connectivity. Built with React, Vite, and IndexedDB for offline-first functionality.

## ✨ Features

- **Offline-First Design**: Content is cached locally and accessible without internet
- **Smart Synchronization**: Downloads content when online, stores for offline use
- **Progressive Web App**: Installable on mobile devices with native app-like experience
- **Content Management**: Download, view, and manage educational videos, images, and quizzes
- **Responsive Design**: Works seamlessly on all device sizes
- **Lightweight**: Optimized for low-bandwidth and limited storage environments

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts to deploy

### Option 2: Netlify (Free)
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`

### Option 3: GitHub Pages
1. Add to package.json scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```
2. Install: `npm i -D gh-pages`
3. Deploy: `npm run deploy`

## 🏗️ Architecture

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **IndexedDB** - Local content storage
- **PWA** - Service worker for offline functionality

### Offline Strategy
1. **Content Preloading**: Download educational materials when online
2. **Local Storage**: Store content in IndexedDB for offline access
3. **Smart Sync**: Periodic synchronization when connectivity is available
4. **Cache Management**: Efficient storage and retrieval of media files

### Content Types Supported
- 📹 **Videos**: Compressed educational videos
- 🖼️ **Images**: Interactive storyboards and diagrams
- 📝 **Quizzes**: HTML5-based interactive assessments

## 🔧 Configuration

### Environment Variables
Before running the app, you need to set up your environment variables:

1. **Copy the environment template:**
```bash
cp env-template.txt .env
```

2. **Fill in your actual values in the `.env` file:**
   - Replace the Supabase URL and key with your actual values
   - Add your Firebase configuration if you're using Firebase
   - Keep the `.env` file out of version control (it's already in `.gitignore`)

### PWA Settings
Edit `vite.config.js` to customize:
- App name and description
- Icon sizes and formats
- Cache strategies
- Service worker behavior

### Content Sources
Modify `src/components/ContentManager.jsx` to:
- Add real API endpoints
- Configure content types
- Set download limits
- Implement content validation

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Mode**: Works without internet connection
- **Background Sync**: Syncs content when connection returns
- **Push Notifications**: Alert users about new content (configurable)

## 🧪 Testing Offline Functionality

1. **Start the app** and download some content
2. **Disconnect internet** or use DevTools → Network → Offline
3. **Verify content** is still accessible
4. **Reconnect** and test sync functionality

## 🚧 Development Roadmap

- [ ] Real API integration
- [ ] Content compression algorithms
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Offline quiz functionality
- [ ] Content versioning
- [ ] User progress tracking

## 🤝 Contributing

This is a proof-of-concept for rural education. Contributions welcome!

## 📄 License

MIT License - Feel free to use for educational purposes.

## 🌍 Impact

This app addresses the digital divide in rural education by:
- Providing offline access to quality educational content
- Reducing dependency on consistent internet connectivity
- Enabling teachers to prepare lessons offline
- Supporting student learning in low-connectivity areas

---

**Built with ❤️ for rural education**
