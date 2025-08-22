import { openDB } from 'idb';

class OfflineStorageService {
  constructor() {
    this.dbName = 'eduContentDB';
    this.version = 1;
    this.initDatabase();
  }

  // Initialize IndexedDB with proper structure
  async initDatabase() {
    try {
      const db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Content metadata store
          if (!db.objectStoreNames.contains('content')) {
            const contentStore = db.createObjectStore('content', { keyPath: 'id' });
            contentStore.createIndex('type', 'type');
            contentStore.createIndex('subject', 'subject');
            contentStore.createIndex('downloadedAt', 'downloadedAt');
          }
          
          // File chunks store for large files
          if (!db.objectStoreNames.contains('fileChunks')) {
            const chunksStore = db.createObjectStore('fileChunks', { keyPath: 'id' });
            chunksStore.createIndex('contentId', 'contentId');
          }
          
          // User preferences store
          if (!db.objectStoreNames.contains('preferences')) {
            db.createObjectStore('preferences', { keyPath: 'key' });
          }
        }
      });
      
      console.log('Offline storage database initialized successfully');
      return db;
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw error;
    }
  }

  // Download and store content offline (like YouTube download)
  async downloadContent(content) {
    try {
      console.log(`Starting download for: ${content.title}`);
      
      // Check available storage
      if (!await this.checkStorageQuota(content.size)) {
        throw new Error('Insufficient storage space');
      }

      // Download the actual file content
      const fileBlob = await this.downloadFile(content.url, content.type);
      
      // Compress if possible (simulate compression for now)
      const compressedBlob = await this.compressFile(fileBlob, content.type);
      
      // Store file in chunks if it's large
      const fileId = await this.storeFileInChunks(content.id, compressedBlob);
      
      // Store metadata
      const contentMetadata = {
        ...content,
        fileId,
        downloadedAt: new Date().toISOString(),
        isDownloaded: true,
        localSize: compressedBlob.size,
        originalSize: content.size,
        compressionRatio: (compressedBlob.size / this.parseSize(content.size)).toFixed(2)
      };
      
      await this.storeContentMetadata(contentMetadata);
      
      console.log(`✅ ${content.title} downloaded and stored offline`);
      return contentMetadata;
      
    } catch (error) {
      console.error(`❌ Download failed for ${content.title}:`, error);
      throw error;
    }
  }

  // Download actual file from URL
  async downloadFile(url, type) {
    try {
      console.log(`Downloading file from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log(`Downloaded ${blob.size} bytes`);
      
      return blob;
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  // Compress file based on type (simulate compression)
  async compressFile(blob, type) {
    // In a real app, you'd use actual compression libraries
    // For now, we'll simulate compression
    
    if (type === 'video') {
      // Simulate video compression (H.264/HEVC)
      console.log('Applying video compression (H.264)...');
      // In reality: use FFmpeg.js or similar for video compression
    } else if (type === 'image') {
      // Simulate image compression (WebP/JPEG)
      console.log('Applying image compression (WebP)...');
      // In reality: use Canvas API for image compression
    }
    
    // For demo purposes, return the original blob
    // In production, return the compressed version
    return blob;
  }

  // Store large files in chunks (for very large videos)
  async storeFileInChunks(contentId, blob) {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = [];
    
    for (let i = 0; i < blob.size; i += chunkSize) {
      chunks.push(blob.slice(i, i + chunkSize));
    }
    
    const fileId = `file_${contentId}_${Date.now()}`;
    
    for (let i = 0; i < chunks.length; i++) {
      await this.storeFileChunk(fileId, i, chunks[i]);
    }
    
    return fileId;
  }

  // Store individual file chunk
  async storeFileChunk(fileId, chunkIndex, chunk) {
    const db = await openDB(this.dbName, this.version);
    await db.put('fileChunks', {
      id: `${fileId}_chunk_${chunkIndex}`,
      contentId: fileId,
      chunkIndex,
      data: chunk,
      timestamp: Date.now()
    });
  }

  // Store content metadata
  async storeContentMetadata(content) {
    const db = await openDB(this.dbName, this.version);
    await db.put('content', content);
  }

  // Retrieve offline content
  async getOfflineContent(contentId) {
    try {
      const db = await openDB(this.dbName, this.version);
      
      // Get metadata
      const metadata = await db.get('content', contentId);
      if (!metadata) {
        throw new Error('Content not found offline');
      }
      
      // Reconstruct file from chunks
      const fileBlob = await this.reconstructFileFromChunks(metadata.fileId);
      
      return {
        ...metadata,
        fileBlob,
        offlineUrl: URL.createObjectURL(fileBlob)
      };
      
    } catch (error) {
      console.error('Failed to retrieve offline content:', error);
      throw error;
    }
  }

  // Reconstruct file from chunks
  async reconstructFileFromChunks(fileId) {
    const db = await openDB(this.dbName, this.version);
    
    // Get all chunks for this file
    const chunks = await db.getAllFromIndex('fileChunks', 'contentId', fileId);
    
    // Sort by chunk index
    chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
    
    // Combine chunks into single blob
    const blobParts = chunks.map(chunk => chunk.data);
    return new Blob(blobParts);
  }

  // Get all offline content
  async getAllOfflineContent() {
    const db = await openDB(this.dbName, this.version);
    return await db.getAll('content');
  }

  // Check storage quota
  async checkStorageQuota(requiredSize) {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const available = estimate.quota - estimate.usage;
      const required = this.parseSize(requiredSize);
      
      console.log(`Storage: ${available} available, ${required} required`);
      return available > required;
    }
    
    // Fallback: assume we have enough space
    return true;
  }

  // Parse size string (e.g., "15MB" to bytes)
  parseSize(sizeStr) {
    const size = parseFloat(sizeStr);
    const unit = sizeStr.replace(/[\d.]/g, '').toUpperCase();
    
    const multipliers = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    
    return size * (multipliers[unit] || 1);
  }

  // Delete offline content
  async deleteOfflineContent(contentId) {
    try {
      const db = await openDB(this.dbName, this.version);
      
      // Get metadata to find fileId
      const metadata = await db.get('content', contentId);
      if (metadata && metadata.fileId) {
        // Delete all chunks for this file
        const chunks = await db.getAllFromIndex('fileChunks', 'contentId', metadata.fileId);
        for (const chunk of chunks) {
          await db.delete('fileChunks', chunk.id);
        }
      }
      
      // Delete metadata
      await db.delete('content', contentId);
      
      console.log(`✅ ${contentId} deleted from offline storage`);
    } catch (error) {
      console.error('Failed to delete offline content:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    const db = await openDB(this.dbName, this.version);
    const allContent = await db.getAll('content');
    
    const totalSize = allContent.reduce((sum, content) => {
      return sum + (content.localSize || 0);
    }, 0);
    
    const contentCount = allContent.length;
    const subjects = [...new Set(allContent.map(c => c.subject))];
    
    return {
      totalSize,
      contentCount,
      subjects,
      lastSync: allContent.length > 0 ? 
        new Date(Math.max(...allContent.map(c => new Date(c.downloadedAt)))) : null
    };
  }

  // Clear all offline content
  async clearAllOfflineContent() {
    try {
      const db = await openDB(this.dbName, this.version);
      
      // Clear all stores
      await db.clear('content');
      await db.clear('fileChunks');
      
      console.log('✅ All offline content cleared');
    } catch (error) {
      console.error('Failed to clear offline content:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();
export default offlineStorage; 