// Real-time online user tracking using localStorage and timestamps
// This allows users to see who's currently using the dApp

const ONLINE_USERS_KEY = 'helios_online_users';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const ONLINE_THRESHOLD = 60000; // 1 minute (user is offline if no heartbeat)

/**
 * Update current user's online status
 */
export const updateOnlineStatus = (address, username) => {
  if (!address) return;

  const onlineUsers = getOnlineUsers();
  
  // Update or add current user
  onlineUsers[address.toLowerCase()] = {
    address: address.toLowerCase(),
    username: username || 'Anonymous',
    lastSeen: Date.now(),
    isOnline: true
  };

  // Save to localStorage
  localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
  
  console.log('💚 Updated online status for:', username);
};

/**
 * Get all currently online users
 */
export const getOnlineUsers = () => {
  try {
    const stored = localStorage.getItem(ONLINE_USERS_KEY);
    const users = stored ? JSON.parse(stored) : {};
    
    // Clean up offline users
    const now = Date.now();
    const activeUsers = {};
    
    Object.keys(users).forEach(address => {
      const user = users[address];
      const timeSinceLastSeen = now - user.lastSeen;
      
      if (timeSinceLastSeen < ONLINE_THRESHOLD) {
        activeUsers[address] = {
          ...user,
          isOnline: true
        };
      }
    });
    
    return activeUsers;
  } catch (error) {
    console.error('Error getting online users:', error);
    return {};
  }
};

/**
 * Get count of online users
 */
export const getOnlineUserCount = () => {
  const users = getOnlineUsers();
  return Object.keys(users).length;
};

/**
 * Remove user from online list (when they disconnect)
 */
export const setUserOffline = (address) => {
  if (!address) return;

  const onlineUsers = getOnlineUsers();
  delete onlineUsers[address.toLowerCase()];
  
  localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
  
  console.log('💔 User went offline:', address);
};

/**
 * Start heartbeat to keep user online
 */
export const startHeartbeat = (address, username) => {
  if (!address) return null;

  // Initial update
  updateOnlineStatus(address, username);

  // Set up interval
  const intervalId = setInterval(() => {
    updateOnlineStatus(address, username);
  }, HEARTBEAT_INTERVAL);

  console.log('💓 Started heartbeat for:', username);
  
  return intervalId;
};

/**
 * Stop heartbeat and set user offline
 */
export const stopHeartbeat = (intervalId, address) => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('💔 Stopped heartbeat');
  }
  
  if (address) {
    setUserOffline(address);
  }
};

/**
 * Get online users as array (sorted by most recent)
 */
export const getOnlineUsersArray = () => {
  const users = getOnlineUsers();
  return Object.values(users).sort((a, b) => b.lastSeen - a.lastSeen);
};

/**
 * Check if specific user is online
 */
export const isUserOnline = (address) => {
  if (!address) return false;
  const users = getOnlineUsers();
  return !!users[address.toLowerCase()];
};

export default {
  updateOnlineStatus,
  getOnlineUsers,
  getOnlineUserCount,
  setUserOffline,
  startHeartbeat,
  stopHeartbeat,
  getOnlineUsersArray,
  isUserOnline
};
