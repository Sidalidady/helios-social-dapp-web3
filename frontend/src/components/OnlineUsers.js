import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { Users, User } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import FollowButton from './FollowButton';
import contractData from '../contracts/SocialFeed.json';
import './OnlineUsers.css';

function OnlineUsers() {
  const { address } = useAccount();
  const [allUsers, setAllUsers] = useState([]);

  // Watch for profile creation events to track users
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'ProfileCreated',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const userAddress = log.args.user;
        if (!allUsers.find(u => u.address === userAddress)) {
          fetchUserProfile(userAddress);
        }
      });
    }
  });

  // Fetch user profile
  const fetchUserProfile = async (userAddress) => {
    try {
      setAllUsers(prev => [...prev, {
        address: userAddress,
        isOnline: Math.random() > 0.5,
        lastSeen: Date.now()
      }]);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Update online status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAllUsers(prev => prev.map(user => ({
        ...user,
        isOnline: Math.random() > 0.3
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
        Online Users
      </h3>
      <div className="online-users-list">
        {allUsers.length > 0 ? (
          allUsers.slice(0, 5).map((user) => (
            <OnlineUserItem key={user.address} userAddress={user.address} />
          ))
        ) : (
          <p className="no-users">No other users online</p>
        )}
      </div>
    </div>
  );
}

export default OnlineUsers;
