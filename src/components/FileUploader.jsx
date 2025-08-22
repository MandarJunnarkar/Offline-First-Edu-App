import React, { useState } from 'react'
import { offlineStorage } from '../services/OfflineStorageService'

function FileUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Create a mock content object for the uploaded file
      const content = {
        id: `uploaded_${Date.now()}`,
        title: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        type: getFileType(selectedFile),
        size: formatFileSize(selectedFile.size),
        description: `Uploaded file: ${selectedFile.name}`,
        url: URL.createObjectURL(selectedFile), // Create local URL for testing
        thumbnail: generateThumbnail(selectedFile),
        subject: 'Uploaded Content',
        grade: 'All Grades',
        tags: ['uploaded', 'test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Store the file in offline storage
      const downloadedContent = await offlineStorage.downloadContent(content)
      
      // Clean up the object URL
      URL.revokeObjectURL(content.url)
      
      setUploadProgress(100)
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(downloadedContent)
      }

      alert(`✅ File uploaded and stored offline successfully!`)
      
      // Reset form
      setSelectedFile(null)
      setUploadProgress(0)
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`❌ Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getFileType = (file) => {
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('text/') || file.type.includes('json')) return 'quiz'
    return 'document'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const generateThumbnail = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    
    // Generate placeholder thumbnails for different file types
    const type = getFileType(file)
    const colors = {
      video: '2563eb',
      image: '10b981',
      quiz: 'f59e0b',
      document: '8b5cf6'
    }
    
    return `https://via.placeholder.com/300x200/${colors[type]}/ffffff?text=${type.toUpperCase()}`
  }

  return (
    <div className="file-uploader">
      <h4>📁 Upload Test Files</h4>
      <p>Upload files to test the offline storage system</p>
      
      <div className="upload-area">
        <input
          type="file"
          onChange={handleFileSelect}
          accept="video/*,image/*,text/*,.json,.pdf,.doc,.docx"
          className="file-input"
          disabled={uploading}
        />
        
        {selectedFile && (
          <div className="file-info">
            <p><strong>Selected:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {getFileType(selectedFile)}</p>
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`upload-button ${!selectedFile || uploading ? 'disabled' : ''}`}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload & Store Offline'}
        </button>
        
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </div>
      
      <div className="upload-tips">
        <h5>💡 Upload Tips:</h5>
        <ul>
          <li><strong>Videos:</strong> MP4, WebM (max 50MB for testing)</li>
          <li><strong>Images:</strong> JPEG, PNG, WebP (max 10MB)</li>
          <li><strong>Documents:</strong> PDF, JSON, Text files</li>
          <li><strong>Test:</strong> Upload small files first to verify</li>
        </ul>
      </div>
    </div>
  )
}

export default FileUploader 