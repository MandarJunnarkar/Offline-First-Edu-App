import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your Firebase configuration - Load from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Content collection reference
export const contentCollection = collection(db, 'educational-content');

// CRUD operations for content
export const contentService = {
  // Get all content from cloud
  async getAllContent() {
    try {
      const querySnapshot = await getDocs(contentCollection);
      const content = [];
      querySnapshot.forEach((doc) => {
        content.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return content;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  // Add new content to cloud
  async addContent(contentData) {
    try {
      const docRef = await addDoc(contentCollection, {
        ...contentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  },

  // Update existing content
  async updateContent(id, updates) {
    try {
      const docRef = doc(db, 'educational-content', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  // Delete content
  async deleteContent(id) {
    try {
      const docRef = doc(db, 'educational-content', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  // Upload file to Firebase Storage
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};

export default app; 