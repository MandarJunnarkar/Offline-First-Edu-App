import React from 'react'

function OfflineIndicator({ isOnline }) {
  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="status-dot"></div>
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  )
}

export default OfflineIndicator 