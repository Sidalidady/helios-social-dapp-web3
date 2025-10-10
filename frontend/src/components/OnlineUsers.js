import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { Users, User } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import FollowButton from './FollowButton';
import { contractData } from '../utils/contract';
import './OnlineUsers.css';

function AllUsers() {
  const { address } = useAccount();
  const [allUsers, setAllUsers] = useState([]);

  // Get all registered users directly from blockchain
  const { data: registeredUsers, refetch: refetchUsers } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getAllRegisteredUsers',
  });

  // Load all registered users directly from blockchain
  useEffect(() => {
    if (!registeredUsers || !Array.isArray(registeredUsers)) {
      console.log('⏳ Waiting for registered users from blockchain...');
      return;
    }

    console.log('📊 Loaded', registeredUsers.length, 'registered users from blockchain');
    
    // Filter out current user and convert to lowercase
    const userAddresses = registeredUsers
      .map(addr => addr.toLowerCase())
      .filter(addr => !address || addr !== address.toLowerCase());
    
    console.log('👥 Showing', userAddresses.length, 'users (excluding yourself)');
    setAllUsers(userAddresses);
  }, [registeredUsers, address]);

  // Watch for new profile creation events
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'ProfileCreated',
    onLogs: (logs) => {
      console.log('🆕 New profile created, refreshing users...');
      logs.forEach((log) => {
        const newUserAddress = log.args.user;
        const username = log.args.displayName;
        console.log('✅ New user registered:', username, '-', newUserAddress);
      });
      // Refresh user list from blockchain
      refetchUsers();
    }
  });

  // Auto-refresh user list every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing user list from blockchain...');
      refetchUsers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchUsers]);

  // Component to display user
  const UserItem = ({ userAddress }) => {
    const { data: userProfile } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getUserProfile',
      args: [userAddress],
      enabled: !!userAddress,
    });

    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
      if (userProfile?.profileIpfsHash) {
        getFromIPFS(userProfile.profileIpfsHash).then(data => {
          if (data?.image) setProfileImage(data.image);
        });
      } else if (userProfile?.profileImageHash) {
        getFromIPFS(userProfile.profileImageHash).then(data => {
          if (data?.image) setProfileImage(data.image);
        });
      }
    }, [userProfile]);

    // Guard against undefined userAddress - after hooks
    if (!userAddress) return null;
    
    const username = userProfile?.displayName || formatAddress(userAddress);
    const isCurrentUser = address && userAddress?.toLowerCase() === address?.toLowerCase();

    // Debug logging
    console.log('👤 User in list:', {
      address: userAddress,
      username: username,
      hasProfile: !!userProfile,
      displayName: userProfile?.displayName
    });

    if (isCurrentUser) return null;

    return (
      <div className="online-user-item">
        <div className="online-user-avatar-container">
          <div className="online-user-avatar">
            {profileImage ? (
              <img src={profileImage} alt={username} />
            ) : (
              <User size={16} />
            )}
          </div>
        </div>
        <div className="online-user-info">
          <div className="online-user-name">@{username}</div>
        </div>
        <FollowButton targetAddress={userAddress} size="medium" />
      </div>
    );
  };

  return (
    <div className="online-users-section">
      <h3 className="online-users-title">
        <Users size={14} />
        Users on dApp ({allUsers.length})
      </h3>
      <div className="online-users-list">
        {allUsers.length > 0 ? (
          allUsers.map((userAddr) => (
            <UserItem 
              key={userAddr} 
              userAddress={userAddr}
            />
          ))
        ) : (
          <p className="no-users">No other users yet. Invite your friends!</p>
        )}
      </div>
    </div>
  );
}

export default AllUsers;
