// IndexedDB for notifications - Better than localStorage
// Supports larger storage, structured data, and better performance

const DB_NAME = 'HeliosSocialNotifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

// Open/Create IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        
        // Create indexes for faster queries
        objectStore.createIndex('userAddress', 'userAddress', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('read', 'read', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
      }
    };
  });
};

// Save notification to IndexedDB
export const saveNotification = async (userAddress, notification) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const notificationWithUser = {
      ...notification,
      userAddress: userAddress.toLowerCase(),
      timestamp: notification.timestamp || Date.now(),
      read: notification.read || false
    };
    
    await store.add(notificationWithUser);
    
    console.log('💾 Notification saved to IndexedDB:', notificationWithUser);
    return true;
  } catch (error) {
    console.error('❌ Error saving notification:', error);
    return false;
  }
};

// Get all notifications for a user
export const getNotifications = async (userAddress) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userAddress');
    
    const request = index.getAll(userAddress.toLowerCase());
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const notifications = request.result;
        // Sort by timestamp descending (newest first)
        notifications.sort((a, b) => b.timestamp - a.timestamp);
        console.log('📥 Loaded', notifications.length, 'notifications from IndexedDB');
        resolve(notifications);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return [];
  }
};

// Get unread count
export const getUnreadCount = async (userAddress) => {
  try {
    const notifications = await getNotifications(userAddress);
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log('🔔 Unread notifications:', unreadCount);
    return unreadCount;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const notification = await store.get(notificationId);
    
    if (notification) {
      notification.read = true;
      await store.put(notification);
      console.log('✅ Notification marked as read:', notificationId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    return false;
  }
};

// Mark all as read
export const markAllAsRead = async (userAddress) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userAddress');
    
    const request = index.openCursor(userAddress.toLowerCase());
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const notification = cursor.value;
          notification.read = true;
          cursor.update(notification);
          cursor.continue();
        } else {
          console.log('✅ All notifications marked as read');
          resolve(true);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    return false;
  }
};

// Clear old notifications (keep last 100)
export const clearOldNotifications = async (userAddress, keepCount = 100) => {
  try {
    const notifications = await getNotifications(userAddress);
    
    if (notifications.length <= keepCount) {
      return; // Nothing to clear
    }
    
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Delete oldest notifications
    const toDelete = notifications.slice(keepCount);
    
    for (const notification of toDelete) {
      await store.delete(notification.id);
    }
    
    console.log('🗑️ Cleared', toDelete.length, 'old notifications');
    return true;
  } catch (error) {
    console.error('❌ Error clearing old notifications:', error);
    return false;
  }
};

// Delete all notifications for a user
export const clearAllNotifications = async (userAddress) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userAddress');
    
    const request = index.openCursor(userAddress.toLowerCase());
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log('🗑️ All notifications cleared');
          resolve(true);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
    return false;
  }
};

// Migrate from localStorage to IndexedDB
export const migrateFromLocalStorage = async (userAddress) => {
  try {
    const key = `notifications_${userAddress}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const notifications = JSON.parse(stored);
      console.log('🔄 Migrating', notifications.length, 'notifications from localStorage...');
      
      for (const notification of notifications) {
        await saveNotification(userAddress, notification);
      }
      
      // Remove from localStorage after migration
      localStorage.removeItem(key);
      console.log('✅ Migration complete!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error migrating from localStorage:', error);
    return false;
  }
};

export default {
  saveNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearOldNotifications,
  clearAllNotifications,
  migrateFromLocalStorage
};
