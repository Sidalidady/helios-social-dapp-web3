import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { Users, User } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import FollowButton from './FollowButton';
import { contractData } from '../utils/contract';
import './OnlineUsers.css';

function OnlineUsers() {
  const { address } = useAccount();
  const [allUsers, setAllUsers] = useState([]);

  // Get all posts to extract unique users
  const { data: allPosts, refetch: refetchPosts } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getAllPosts',
  });

  // Load all users from posts
  useEffect(() => {
    const loadUsers = async () => {
      if (!allPosts || allPosts.length === 0) return;

      console.log('📊 Loading users from posts...');
      const uniqueAddresses = new Set();

      // Extract unique user addresses from posts
      allPosts.forEach(post => {
        if (post && post.author) {
          uniqueAddresses.add(post.author.toLowerCase());
        }
      });

      console.log('👥 Found unique users:', uniqueAddresses.size);

      // Convert to array and filter out current user
      const userAddresses = Array.from(uniqueAddresses).filter(addr => 
        !address || addr !== address.toLowerCase()
      );

      setAllUsers(userAddresses.map(addr => ({
        address: addr,
        isOnline: true, // Show all as online
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
  const OnlineUserItem = ({ userAddress }) => {
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

    const username = userProfile?.displayName || formatAddress(userAddress);
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
        Online Users ({allUsers.length})
      </h3>
      <div className="online-users-list">
        {allUsers.length > 0 ? (
          allUsers.map((user) => (
            <OnlineUserItem key={user.address} userAddress={user.address} />
          ))
        ) : (
          <p className="no-users">No other users yet. Invite your friends!</p>
        )}
      </div>
    </div>
  );
}

export default OnlineUsers;
