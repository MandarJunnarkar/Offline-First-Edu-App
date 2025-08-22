import React from 'react'

function SyncStatus({ isOnline, lastSync, onSync }) {
  const formatLastSync = (date) => {
    if (!date) return 'Never'
    return date.toLocaleString()
  }

  return (
    <div className="sync-status">
      <div className="sync-info">
        <h3>🔄 Synchronization Status</h3>
        <p>Last sync: {formatLastSync(lastSync)}</p>
        <p>Status: {isOnline ? '🟢 Connected' : '🔴 Disconnected'}</p>
      </div>
      
      <button 
        className={`sync-button ${!isOnline ? 'disabled' : ''}`}
        onClick={onSync}
        disabled={!isOnline}
      >
        {isOnline ? '🔄 Sync Now' : '⏸️ Offline'}
      </button>
    </div>
  )
}

export default SyncStatus 