// Real-time online user tracking using BLOCKCHAIN
// True Web3 - works across all devices and tabs!

import { writeContract, readContract } from 'wagmi/actions';
import { config } from '../config/wagmi';
import { contractData } from './contract';

const HEARTBEAT_INTERVAL = 60000; // 60 seconds (1 minute)
const ONLINE_THRESHOLD = 120000; // 2 minutes (matches smart contract)

/**
 * Update current user's online status on BLOCKCHAIN
 */
export const updateOnlineStatus = async (address, username) => {
  if (!address) return;

  try {
    // Update on blockchain
    await writeContract(config, {
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'updateOnlineStatus',
    });
    
    console.log('💚 Updated online status on blockchain for:', username);
    return true;
  } catch (error) {
    console.error('Error updating online status:', error);
    return false;
  }
};

/**
 * Get all currently online users from BLOCKCHAIN
 */
export const getOnlineUsers = async () => {
  try {
    const result = await readContract(config, {
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getOnlineUsers',
    });
    
    const [addresses, usernames, lastSeenTimes] = result;
    
    // Convert to object format
    const users = {};
    for (let i = 0; i < addresses.length; i++) {
      users[addresses[i].toLowerCase()] = {
        address: addresses[i].toLowerCase(),
        username: usernames[i],
        lastSeen: Number(lastSeenTimes[i]) * 1000,
        isOnline: true
      };
    }
    
    console.log('📥 Loaded', addresses.length, 'online users from blockchain');
    return users;
  } catch (error) {
    console.error('Error getting online users from blockchain:', error);
    return {};
  }
};

/**
 * Get count of online users
 */
export const getOnlineUserCount = async () => {
  const users = await getOnlineUsers();
  return Object.keys(users).length;
};

/**
 * Remove user from online list (no-op for blockchain, handled automatically)
 */
export const setUserOffline = (address) => {
  // Blockchain automatically marks users offline after 2 minutes
  console.log('💔 User disconnected (will be marked offline automatically):', address);
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
export const getOnlineUsersArray = async () => {
  const users = await getOnlineUsers();
  return Object.values(users).sort((a, b) => b.lastSeen - a.lastSeen);
};

/**
 * Check if specific user is online
 */
export const isUserOnline = async (address) => {
  if (!address) return false;
  
  try {
    const result = await readContract(config, {
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'isUserOnline',
      args: [address],
    });
    
    return result;
  } catch (error) {
    console.error('Error checking if user is online:', error);
    return false;
  }
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
