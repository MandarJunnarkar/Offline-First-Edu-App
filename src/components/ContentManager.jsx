import React, { useState, useEffect } from 'react'
import { contentService } from '../supabase'
import { offlineStorage } from '../services/OfflineStorageService'
import { openDB } from 'idb'

function ContentManager({ isOnline }) {
  const [contents, setContents] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [storageStats, setStorageStats] = useState(null)
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [availableClasses, setAvailableClasses] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedContentType, setSelectedContentType] = useState('all')

  useEffect(() => {
    loadOfflineContent()
    if (isOnline) {
      fetchCloudContent()
    }
    loadStorageStats()
  }, [isOnline])

  useEffect(() => {
    // Extract unique subjects and classes from available content
    if (contents.length > 0) {
      const subjects = [...new Set(contents.map(c => c.subject).filter(Boolean))]
      const classes = [...new Set(contents.map(c => c.grade).filter(Boolean))]
      
      setAvailableSubjects(subjects)
      setAvailableClasses(classes)
    }
  }, [contents])

  const loadOfflineContent = async () => {
    try {
      console.log('Loading offline content...')
      const offlineContent = await offlineStorage.getAllOfflineContent()
      console.log('Offline content loaded:', offlineContent)
      
      // Mark all offline content as downloaded
      const markedContent = offlineContent.map(content => ({
        ...content,
        isDownloaded: true
      }))
      
      setContents(markedContent)
      setLoading(false)
    } catch (error) {
      console.error('Error loading offline content:', error)
      setError('Failed to load offline content')
      setLoading(false)
    }
  }

  const fetchCloudContent = async () => {
    try {
      setLoading(true)
      const cloudContent = await contentService.getAllContent()
      
      // Merge cloud content with offline content
      const mergedContent = cloudContent.map(cloudItem => {
        const offlineItem = contents.find(offline => offline.id === cloudItem.id)
        return offlineItem ? { ...cloudItem, ...offlineItem } : cloudItem
      })
      
      setContents(mergedContent)
      setError(null)
    } catch (error) {
      console.error('Error fetching cloud content:', error)
      setError('Failed to fetch cloud content')
    } finally {
      setLoading(false)
    }
  }

  const downloadContent = async (content) => {
    if (!isOnline) return
    
    setDownloading(true)
    try {
      console.log(`Starting real download for: ${content.title}`);
      
      // Use the offline storage service to download and store content
      const downloadedContent = await offlineStorage.downloadContent(content)
      
      // Update the content list
      await loadOfflineContent()
      
      // Show success message with compression info
      const compressionInfo = downloadedContent.compressionRatio ? 
        ` (Compressed: ${downloadedContent.compressionRatio}x)` : '';
      
      alert(`✅ ${content.title} downloaded successfully!${compressionInfo}`)
      
      // Update storage stats
      await loadStorageStats()
      
    } catch (error) {
      console.error('Download failed:', error)
      alert(`❌ Download failed: ${error.message}`)
    } finally {
      setDownloading(false)
    }
  }

  const deleteContent = async (contentId) => {
    try {
      await offlineStorage.deleteOfflineContent(contentId)
      await loadOfflineContent()
      await loadStorageStats()
      alert('Content deleted successfully!')
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete content')
    }
  }

  const isContentDownloaded = (contentId) => {
    const content = contents.find(c => c.id === contentId)
    return content && (content.isDownloaded || content.fileId)
  }

  const handleRefresh = () => {
    if (isOnline) {
      fetchCloudContent()
    }
  }

  const loadStorageStats = async () => {
    try {
      console.log('Loading storage stats...')
      const stats = await offlineStorage.getStorageStats()
      console.log('Storage stats loaded:', stats)
      setStorageStats(stats)
    } catch (error) {
      console.error('Failed to load storage stats:', error)
    }
  }

  // Filter content based on selected subject, class, and content type
  const getFilteredContent = () => {
    return contents.filter(content => {
      const subjectMatch = selectedSubject === 'all' || content.subject === selectedSubject
      const classMatch = selectedClass === 'all' || content.grade === selectedClass
      const typeMatch = selectedContentType === 'all' || content.type === selectedContentType
      return subjectMatch && classMatch && typeMatch
    })
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const viewOfflineContent = async (content) => {
    try {
      const offlineContent = await offlineStorage.getOfflineContent(content.id)
      setSelectedContent(offlineContent)
    } catch (error) {
      console.error('Failed to load offline content:', error)
      alert('Failed to load offline content. It may have been corrupted.')
    }
  }

  if (loading) {
    return (
      <div className="content-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading educational content from cloud...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-manager">
        <div className="error-state">
          <p>❌ {error}</p>
          {isOnline && (
            <button onClick={handleRefresh} className="retry-button">
              🔄 Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  const filteredContent = getFilteredContent()

  return (
    <div className="content-manager">
      <div className="content-header">
        <h3>📖 Government Educational Content</h3>
        <p>Access approved curriculum content for rural education</p>
        <div className="header-actions">
          {isOnline && (
            <button onClick={handleRefresh} className="refresh-button">
              🔄 Refresh from Cloud
            </button>
          )}
        </div>
      </div>

      {/* Content Filters */}
      {contents.length > 0 && (
        <div className="content-filters">
          <h4>🔍 Filter Content</h4>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Subject:</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Subjects</option>
                {availableSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Classes</option>
                {availableClasses.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Content Type:</label>
              <select 
                value={selectedContentType} 
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="video">📹 Videos</option>
                <option value="image">🖼️ Images</option>
                <option value="quiz">📝 Quizzes</option>
                <option value="document">📄 Documents</option>
              </select>
            </div>
          </div>
          
          <div className="filter-summary">
            <p>
              Showing {filteredContent.length} of {contents.length} content items
              {selectedSubject !== 'all' && ` for ${selectedSubject}`}
              {selectedClass !== 'all' && ` in ${selectedClass}`}
              {selectedContentType !== 'all' && ` of type ${selectedContentType}`}
            </p>
          </div>
        </div>
      )}

      {/* Storage Statistics */}
      {storageStats && (
        <div className="storage-stats">
          <h4>💾 Offline Storage</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Content Count:</span>
              <span className="stat-value">{storageStats.contentCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Size:</span>
              <span className="stat-value">{formatBytes(storageStats.totalSize)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Subjects:</span>
              <span className="stat-value">{storageStats.subjects.join(', ')}</span>
            </div>
            {storageStats.lastSync && (
              <div className="stat-item">
                <span className="stat-label">Last Sync:</span>
                <span className="stat-value">{new Date(storageStats.lastSync).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredContent.length === 0 ? (
        <div className="empty-state">
          {contents.length === 0 ? (
            <>
              <p>📚 No content available from cloud yet</p>
              <p>Government administrators need to upload content for subjects and classes</p>
            </>
          ) : (
            <>
              <p>🔍 No content matches your current filters</p>
              <p>Try selecting different subject, class, or content type combinations</p>
            </>
          )}
        </div>
      ) : (
        <div className="content-grid">
          {filteredContent.map(content => {
            const isDownloaded = isContentDownloaded(content.id)
            
            return (
              <div key={content.id} className="content-card">
                <img 
                  src={content.thumbnail || `https://via.placeholder.com/300x200/2563eb/ffffff?text=${content.title.charAt(0)}`}
                  alt={content.title}
                  className="content-thumbnail"
                />
                
                <div className="content-info">
                  <h4>{content.title}</h4>
                  <p>{content.description}</p>
                  <div className="content-meta">
                    <span className="content-type">{content.type}</span>
                    <span className="content-size">{content.size}</span>
                    {content.subject && <span className="content-subject">{content.subject}</span>}
                    {content.grade && <span className="content-grade">{content.grade}</span>}
                  </div>
                  
                  {/* Show compression info if downloaded */}
                  {isDownloaded && content.compressionRatio && (
                    <div className="compression-info">
                      <span className="compression-badge">
                        🗜️ Compressed {content.compressionRatio}x
                      </span>
                      <span className="local-size">
                        Local: {formatBytes(content.localSize || 0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="content-actions">
                  {isDownloaded ? (
                    <>
                      <button 
                        className="view-button"
                        onClick={() => viewOfflineContent(content)}
                      >
                        👁️ View Offline
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => deleteContent(content.id)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  ) : (
                    <button 
                      className={`download-button ${!isOnline || downloading ? 'disabled' : ''}`}
                      onClick={() => downloadContent(content)}
                      disabled={!isOnline || downloading}
                    >
                      {downloading ? '⏳ Downloading...' : '⬇️ Download'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedContent && (
        <div className="content-modal">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setSelectedContent(null)}
            >
              ✕
            </button>
            <h3>{selectedContent.title}</h3>
            <p>{selectedContent.description}</p>
            
            {/* Show offline indicator */}
            {selectedContent.offlineUrl && (
              <div className="offline-indicator-badge">
                🚀 Playing from Offline Storage
              </div>
            )}
            
            <div className="content-preview">
              {selectedContent.type === 'video' && (
                <video controls className="video-player">
                  <source src={selectedContent.offlineUrl || selectedContent.url} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              )}
              {selectedContent.type === 'image' && (
                <img 
                  src={selectedContent.offlineUrl || selectedContent.url} 
                  alt={selectedContent.title}
                  className="image-preview"
                />
              )}
              {selectedContent.type === 'quiz' && (
                <div className="quiz-preview">
                  <p>📝 Quiz content loaded from offline storage</p>
                  <p>This would display interactive quiz questions in a real implementation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManager 