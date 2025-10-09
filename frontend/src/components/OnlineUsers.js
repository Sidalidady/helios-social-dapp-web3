import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { Users, User } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import FollowButton from './FollowButton';
import { contractData } from '../utils/contract';
import { getOnlineUsersArray } from '../utils/onlineTracker';
import './OnlineUsers.css';

function OnlineUsers() {
  const { address } = useAccount();
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Get all posts to extract unique users
  const { data: allPosts, refetch: refetchPosts } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getAllPosts',
  });

  // Update online users list every 10 seconds (from blockchain)
  useEffect(() => {
    const updateOnlineList = async () => {
      const onlineList = await getOnlineUsersArray();
      console.log('👥 Online users from blockchain:', onlineList.length);
      
      // Filter out current user
      const filteredList = onlineList.filter(user => 
        !address || user.address !== address.toLowerCase()
      );
      
      setOnlineUsers(filteredList);
    };

    // Initial load
    updateOnlineList();

    // Update every 10 seconds (blockchain read is free)
    const interval = setInterval(updateOnlineList, 10000);

    return () => clearInterval(interval);
  }, [address]);

  // Load all registered users from smart contract (fallback)
  useEffect(() => {
    const loadUsers = async () => {
      console.log('📊 Loading all registered users from blockchain...');
      const uniqueAddresses = new Set();

      // Get all posts and extract unique authors
      if (allPosts && allPosts.length > 0) {
        console.log('📝 Checking', allPosts.length, 'posts for authors...');
        
        for (const post of allPosts) {
          if (post && post.author) {
            const authorAddress = post.author.toLowerCase();
            
            // Check if this user has a profile on the blockchain
            try {
              const { readContract } = await import('wagmi/actions');
              const { config } = await import('../config/wagmi');
              
              const userProfile = await readContract(config, {
                address: contractData.address,
                abi: contractData.abi,
                functionName: 'getUserProfile',
                args: [post.author],
              });
              
              // If user has a profile (displayName exists), add them
              if (userProfile && userProfile.displayName && userProfile.displayName.length > 0) {
                uniqueAddresses.add(authorAddress);
                console.log('✅ Found user:', userProfile.displayName, '-', authorAddress);
              }
            } catch (error) {
              console.error('Error checking user profile:', error);
            }
          }
        }
      }

      // Also check localStorage for registered users (backup)
      const stored = localStorage.getItem('all_registered_users');
      if (stored) {
        const registeredUsers = JSON.parse(stored);
        registeredUsers.forEach(addr => uniqueAddresses.add(addr.toLowerCase()));
      }

      console.log('👥 Total unique registered users:', uniqueAddresses.size);

      // Convert to array and filter out current user
      const userAddresses = Array.from(uniqueAddresses).filter(addr => 
        !address || addr !== address.toLowerCase()
      );

      setAllUsers(userAddresses.map(addr => ({
        address: addr,
        isOnline: false,
        lastSeen: Date.now()
      })));
    };

    loadUsers();
  }, [allPosts, address]);

  // Watch for new profile creation events
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'ProfileCreated',
    onLogs: (logs) => {
      console.log('🆕 New profile created, refreshing users...');
      refetchPosts();
    }
  });

  // Watch for new posts to update user list
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostCreated',
    onLogs: (logs) => {
      console.log('📝 New post created, refreshing users...');
      refetchPosts();
    }
  });

  // Component to display user with online status
  const OnlineUserItem = ({ userAddress, trackedUsername }) => {
    const { data: userProfile } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getUserProfile',
      args: [userAddress],
      enabled: !!userAddress,
    });

    const [profileImage, setProfileImage] = useState('');
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
      if (userProfile?.profileImageHash) {
        getFromIPFS(userProfile.profileImageHash).then(data => {
          if (data?.image) setProfileImage(data.image);
        });
      }
      
      setIsOnline(Math.random() > 0.3);
    }, [userProfile]);

    // Guard against undefined userAddress - after hooks
    if (!userAddress) return null;

    // Use tracked username if available, otherwise use profile or address
    const username = trackedUsername || userProfile?.displayName || formatAddress(userAddress);
    const isCurrentUser = address && userAddress?.toLowerCase() === address?.toLowerCase();

    if (isCurrentUser) return null;

    return (
      <div className="online-user-item">
        <div className="online-user-avatar-container">
          <div className="online-user-avatar">
            {profileImage ? (
              <img src={profileImage} alt={username} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className={`online-status ${isOnline ? 'online' : 'offline'}`} />
        </div>
        <div className="online-user-info">
          <span className="online-user-name">{username}</span>
          <span className={`online-user-status-text ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <FollowButton targetAddress={userAddress} />
      </div>
    );
  };

  return (
    <div className="online-users-section">
      <h3 className="online-users-title">
        <Users size={20} />
        Online Users ({onlineUsers.length})
      </h3>
      <div className="online-users-list">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <OnlineUserItem 
              key={user.address} 
              userAddress={user.address}
              trackedUsername={user.username}
            />
          ))
        ) : (
          <p className="no-users">No other users online. Invite your friends!</p>
        )}
      </div>
    </div>
  );
}

export default OnlineUsers;
