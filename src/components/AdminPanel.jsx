import React, { useState } from 'react'
import { contentService, supabase } from '../supabase'

function AdminPanel() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    type: 'video'
  })
  // Add separate state for custom inputs
  const [customSubject, setCustomSubject] = useState('')
  const [customGrade, setCustomGrade] = useState('')
  const [showCustomSubject, setShowCustomSubject] = useState(false)
  const [showCustomGrade, setShowCustomGrade] = useState(false)
  // Add state for delete functionality
  const [uploadedContent, setUploadedContent] = useState([])
  const [deleteFilters, setDeleteFilters] = useState({
    subject: 'all',
    grade: 'all',
    type: 'all'
  })
  const [deleting, setDeleting] = useState(false)

  // Load content when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      loadUploadedContent()
    }
  }, [isAuthenticated])

  // Predefined options
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Civics', 'Economics']
  const grades = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6']
  const contentTypes = ['video', 'image', 'quiz', 'document']

  // Admin password (you can change this)
  const ADMIN_PASSWORD = 'admin123'

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('❌ Incorrect password!')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setContentData({
      title: '',
      description: '',
      subject: '',
      grade: '',
      type: 'video'
    })
    setSelectedFile(null)
    // Reset custom input states
    setCustomSubject('')
    setCustomGrade('')
    setShowCustomSubject(false)
    setShowCustomGrade(false)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size limits
      const maxSize = contentData.type === 'video' ? 15 * 1024 * 1024 : 10 * 1024 * 1024 // 15MB for videos, 10MB for others
      if (file.size > maxSize) {
        const maxSizeMB = contentData.type === 'video' ? '15MB' : '10MB'
        alert(`❌ File too large! Maximum size for ${contentData.type} is ${maxSizeMB}`)
        event.target.value = ''
        return
      }

      setSelectedFile(file)
      // Auto-fill title from filename
      const title = file.name.replace(/\.[^/.]+$/, "")
      setContentData(prev => ({ ...prev, title }))
    }
  }

  const handleInputChange = (field, value) => {
    if (field === 'subject') {
      if (value === 'custom') {
        setShowCustomSubject(true)
        setContentData(prev => ({ ...prev, subject: '' }))
      } else {
        setShowCustomSubject(false)
        setCustomSubject('')
        setContentData(prev => ({ ...prev, subject: value }))
      }
    } else if (field === 'grade') {
      if (value === 'custom') {
        setShowCustomGrade(true)
        setContentData(prev => ({ ...prev, grade: '' }))
      } else {
        setShowCustomGrade(false)
        setCustomGrade('')
        setContentData(prev => ({ ...prev, grade: value }))
      }
    } else {
      setContentData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleCustomInputChange = (field, value) => {
    if (field === 'subject') {
      setCustomSubject(value)
      setContentData(prev => ({ ...prev, subject: value }))
    } else if (field === 'grade') {
      setCustomGrade(value)
      setContentData(prev => ({ ...prev, grade: value }))
    }
  }

  // Load uploaded content for management
  const loadUploadedContent = async () => {
    try {
      const content = await contentService.getAllContent()
      setUploadedContent(content || [])
    } catch (error) {
      console.error('Failed to load content:', error)
      alert('Failed to load uploaded content')
    }
  }

  // Handle content deletion
  const handleDeleteContent = async (contentId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      // Delete from database
      await contentService.deleteContent(contentId)
      
      // Remove from local state
      setUploadedContent(prev => prev.filter(item => item.id !== contentId))
      
      alert(`✅ "${title}" has been deleted successfully`)
    } catch (error) {
      console.error('Delete failed:', error)
      alert(`❌ Failed to delete "${title}": ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // Filter content for deletion
  const getFilteredContentForDelete = () => {
    return uploadedContent.filter(content => {
      const subjectMatch = deleteFilters.subject === 'all' || content.subject === deleteFilters.subject
      const gradeMatch = deleteFilters.grade === 'all' || content.grade === deleteFilters.grade
      const typeMatch = deleteFilters.type === 'all' || content.type === deleteFilters.type
      return subjectMatch && gradeMatch && typeMatch
    })
  }

  const handleUpload = async () => {
    if (!selectedFile || !contentData.title || !contentData.subject || !contentData.grade) {
      alert('Please fill all required fields and select a file')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`
      const filePath = `content/${contentData.type}/${fileName}`
      
      // Track upload progress
      setUploadProgress(25)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`)
      }

      setUploadProgress(75)

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('content')
        .getPublicUrl(filePath)

      setUploadProgress(90)

      // Create content object with real file URL
      const content = {
        ...contentData,
        id: `gov_${Date.now()}`,
        size: formatFileSize(selectedFile.size),
        url: urlData.publicUrl,
        thumbnail: generateThumbnail(selectedFile, contentData.type),
        tags: [contentData.subject.toLowerCase(), contentData.grade.toLowerCase(), 'government-approved'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Upload metadata to Supabase database
      await contentService.addContent(content)
      
      setUploadProgress(100)
      alert(`✅ Content uploaded successfully to Supabase!\n\nTitle: ${content.title}\nSubject: ${content.subject}\nClass: ${content.grade}\nFile: ${selectedFile.name}`)
      
      // Reset form
      setSelectedFile(null)
      setContentData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        type: 'video'
      })
      setUploadProgress(0)
      // Reset custom input states
      setCustomSubject('')
      setCustomGrade('')
      setShowCustomSubject(false)
      setShowCustomGrade(false)
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`❌ Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const generateThumbnail = (file, type) => {
    if (type === 'image') {
      return URL.createObjectURL(file)
    }
    
    const colors = {
      video: '2563eb',
      image: '10b981',
      quiz: 'f59e0b',
      document: '8b5cf6'
    }
    
    return `https://via.placeholder.com/300x200/${colors[type]}/ffffff?text=${type.toUpperCase()}`
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>🔐 Government Admin Access</h2>
          <p>Enter password to access content management</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label>🔑 Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="text-input"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button onClick={handleLogin} className="login-button">
            🚀 Login to Admin Panel
          </button>
          
          <div className="login-info">
            <p><strong>Default Password:</strong> admin123</p>
            <p><em>Change this password in the code for production use</em></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🏛️ Government Content Management</h2>
        <p>Upload approved educational content for rural schools</p>
        <button onClick={handleLogout} className="logout-button">
          🚪 Logout
        </button>
      </div>

      <div className="upload-form">
        <h3>📤 Upload New Content</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label>📁 Select File *</label>
            <input
              type="file"
              onChange={handleFileSelect}
              accept="video/*,image/*,text/*,.json,.pdf,.doc,.docx"
              className="file-input"
              disabled={uploading}
            />
            {selectedFile && (
              <div className="file-info">
                <p><strong>File:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Max Size:</strong> {contentData.type === 'video' ? '15MB' : '10MB'}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>📝 Title *</label>
            <input
              type="text"
              value={contentData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter content title"
              className="text-input"
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>📖 Description</label>
            <textarea
              value={contentData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the educational content"
              className="text-area"
              rows="3"
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>📚 Subject *</label>
            <select
              value={contentData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="select-input"
              disabled={uploading}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
              <option value="custom">➕ Add Custom Subject</option>
            </select>
            {showCustomSubject && (
              <input
                type="text"
                value={customSubject}
                placeholder="Enter custom subject name"
                className="text-input"
                onChange={(e) => handleCustomInputChange('subject', e.target.value)}
                disabled={uploading}
              />
            )}
          </div>

          <div className="form-group">
            <label>🎓 Class/Grade *</label>
            <select
              value={contentData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              className="select-input"
              disabled={uploading}
            >
              <option value="">Select Class</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
              <option value="custom">➕ Add Custom Class</option>
            </select>
            {showCustomGrade && (
              <input
                type="text"
                value={customGrade}
                placeholder="Enter custom class name"
                className="text-input"
                onChange={(e) => handleCustomInputChange('grade', e.target.value)}
                disabled={uploading}
              />
            )}
          </div>

          <div className="form-group">
            <label>📋 Content Type *</label>
            <select
              value={contentData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="select-input"
              disabled={uploading}
            >
              {contentTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !contentData.title || !contentData.subject || !contentData.grade || uploading}
            className={`upload-button ${!selectedFile || !contentData.title || !contentData.subject || !contentData.grade || uploading ? 'disabled' : ''}`}
          >
            {uploading ? '⏳ Uploading to Supabase...' : '🚀 Upload to Supabase Cloud'}
          </button>
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>
              {uploadProgress < 25 && '⏳ Starting upload...'}
              {uploadProgress >= 25 && uploadProgress < 75 && '📤 Uploading file to Supabase Storage...'}
              {uploadProgress >= 75 && uploadProgress < 90 && '🔗 Getting file URL...'}
              {uploadProgress >= 90 && uploadProgress < 100 && '💾 Saving metadata...'}
              {uploadProgress === 100 && '✅ Upload complete!'}
            </span>
          </div>
        )}
      </div>

      {/* Content Management Section */}
      <div className="content-management">
        <h3>🗑️ Manage Uploaded Content</h3>
        
        {/* Delete Filters */}
        <div className="delete-filters">
          <h4>🔍 Filter Content for Deletion</h4>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Subject:</label>
              <select 
                value={deleteFilters.subject} 
                onChange={(e) => setDeleteFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="filter-select"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Class:</label>
              <select 
                value={deleteFilters.grade} 
                onChange={(e) => setDeleteFilters(prev => ({ ...prev, grade: e.target.value }))}
                className="filter-select"
              >
                <option value="all">All Classes</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Content Type:</label>
              <select 
                value={deleteFilters.type} 
                onChange={(e) => setDeleteFilters(prev => ({ ...prev, type: e.target.value }))}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {contentTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <button onClick={loadUploadedContent} className="refresh-button">
              🔄 Refresh List
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="content-list">
          <h4>📚 Uploaded Content ({getFilteredContentForDelete().length} items)</h4>
          
          {uploadedContent.length === 0 ? (
            <div className="empty-content">
              <p>📭 No content has been uploaded yet</p>
            </div>
          ) : getFilteredContentForDelete().length === 0 ? (
            <div className="empty-content">
              <p>🔍 No content matches your current filters</p>
              <p>Try selecting different filter options</p>
            </div>
          ) : (
            <div className="content-grid">
              {getFilteredContentForDelete().map(content => (
                <div key={content.id} className="content-item">
                  <div className="content-preview">
                    <img 
                      src={content.thumbnail || `https://via.placeholder.com/100x100/2563eb/ffffff?text=${content.type.charAt(0).toUpperCase()}`}
                      alt={content.title}
                      className="content-thumbnail-small"
                    />
                  </div>
                  
                  <div className="content-details">
                    <h5>{content.title}</h5>
                    <p>{content.description || 'No description'}</p>
                    <div className="content-meta">
                      <span className="content-type">{content.type}</span>
                      <span className="content-subject">{content.subject}</span>
                      <span className="content-grade">{content.grade}</span>
                      <span className="content-size">{content.size}</span>
                    </div>
                    <div className="content-date">
                      Uploaded: {new Date(content.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="content-actions">
                    <button 
                      onClick={() => handleDeleteContent(content.id, content.title)}
                      disabled={deleting}
                      className="delete-content-button"
                    >
                      {deleting ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-info">
        <h4>ℹ️ Upload Guidelines</h4>
        <ul>
          <li><strong>File Types:</strong> Videos (MP4), Images (JPEG/PNG), Documents (PDF), Quizzes (JSON)</li>
          <li><strong>File Size:</strong> Videos max 15MB, Images max 10MB, Documents max 10MB</li>
          <li><strong>Content Quality:</strong> All content must be government-approved and curriculum-aligned</li>
          <li><strong>Subjects:</strong> Mathematics, Science, English, Hindi, History, Geography, Civics, Economics</li>
          <li><strong>Classes:</strong> Primary 1-6 (ages 6-12) or custom classes</li>
          <li><strong>Quizzes:</strong> Upload as JSON files with question data (app renders as HTML)</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminPanel 