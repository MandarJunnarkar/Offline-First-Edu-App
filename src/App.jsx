import React, { useState, useEffect } from 'react'
import './App.css'
import ContentManager from './components/ContentManager'
import AdminPanel from './components/AdminPanel'
import SyncStatus from './components/SyncStatus'
import OfflineIndicator from './components/OfflineIndicator'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSync, setLastSync] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check last sync from localStorage
    const savedLastSync = localStorage.getItem('lastSync')
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync))
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSync = async () => {
    try {
      // Simulate sync with server
      await new Promise(resolve => setTimeout(resolve, 2000))
      const now = new Date()
      setLastSync(now)
      localStorage.setItem('lastSync', now.toISOString())
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Offline-First Educational App</h1>
        <p>Access educational content anytime, anywhere</p>
        
        {/* Admin Toggle */}
        <div className="admin-toggle">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`toggle-button ${isAdmin ? 'admin-active' : 'student-active'}`}
          >
            {isAdmin ? '👨‍🎓 Switch to Student View' : '🏛️ Switch to Admin View'}
          </button>
        </div>
      </header>

      <OfflineIndicator isOnline={isOnline} />

      <main className="app-main">
        {isAdmin ? (
          <>
            <AdminPanel />
            <SyncStatus 
              isOnline={isOnline} 
              lastSync={lastSync} 
              onSync={handleSync}
            />
          </>
        ) : (
          <>
            <SyncStatus 
              isOnline={isOnline} 
              lastSync={lastSync} 
              onSync={handleSync}
            />
            <ContentManager isOnline={isOnline} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          {isAdmin 
            ? 'Government Content Management • Upload Approved Curriculum'
            : 'Built for rural education • Offline-first • Lightweight'
          }
        </p>
      </footer>
    </div>
  )
}

export default App
