import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { addNotification } from './Notifications';
import './FollowButton.css';

function FollowButton({ targetAddress, targetUsername, size = 'medium' }) {
  const { address } = useAccount();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address && targetAddress) {
      checkFollowStatus();
    }
  }, [address, targetAddress]);

  const checkFollowStatus = () => {
    // Get follow list from localStorage
    const followKey = `following_${address}`;
    const following = localStorage.getItem(followKey);
    
    if (following) {
      try {
        const followList = JSON.parse(following);
        setIsFollowing(followList.includes(targetAddress.toLowerCase()));
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    }
  };

  const handleFollow = async () => {
    if (!address || !targetAddress || address.toLowerCase() === targetAddress.toLowerCase()) {
      return;
    }

    setIsLoading(true);

    try {
      const followKey = `following_${address}`;
      const followersKey = `followers_${targetAddress}`;
      
      // Get current following list
      const followingData = localStorage.getItem(followKey);
      const followList = followingData ? JSON.parse(followingData) : [];
      
      // Get target's followers list
      const followersData = localStorage.getItem(followersKey);
      const followersList = followersData ? JSON.parse(followersData) : [];

      if (isFollowing) {
        // Unfollow
        const updatedFollowing = followList.filter(
          addr => addr.toLowerCase() !== targetAddress.toLowerCase()
        );
        const updatedFollowers = followersList.filter(
          addr => addr.toLowerCase() !== address.toLowerCase()
        );
        
        localStorage.setItem(followKey, JSON.stringify(updatedFollowing));
        localStorage.setItem(followersKey, JSON.stringify(updatedFollowers));
        
        setIsFollowing(false);
        console.log('Unfollowed:', targetAddress);
      } else {
        // Follow
        if (!followList.includes(targetAddress.toLowerCase())) {
          followList.push(targetAddress.toLowerCase());
        }
        
        if (!followersList.includes(address.toLowerCase())) {
          followersList.push(address.toLowerCase());
        }
        
        localStorage.setItem(followKey, JSON.stringify(followList));
        localStorage.setItem(followersKey, JSON.stringify(followersList));
        
        // Send notification to followed user
        addNotification(targetAddress, {
          type: 'follow',
          from: address,
          message: 'started following you',
        });
        
        setIsFollowing(true);
        console.log('Followed:', targetAddress);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (!address || !targetAddress || address.toLowerCase() === targetAddress.toLowerCase()) {
    return null;
  }

  const buttonClass = `follow-button ${size} ${isFollowing ? 'following' : 'not-following'}`;

  return (
    <button
      className={buttonClass}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={size === 'small' ? 14 : 16} className="spinning" />
      ) : isFollowing ? (
        <>
          <UserMinus size={size === 'small' ? 14 : 16} />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus size={size === 'small' ? 14 : 16} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}

// Helper functions to get follow data
export const getFollowing = (userAddress) => {
  const followKey = `following_${userAddress}`;
  const data = localStorage.getItem(followKey);
  return data ? JSON.parse(data) : [];
};

export const getFollowers = (userAddress) => {
  const followersKey = `followers_${userAddress}`;
  const data = localStorage.getItem(followersKey);
  return data ? JSON.parse(data) : [];
};

export const getFollowCounts = (userAddress) => {
  return {
    following: getFollowing(userAddress).length,
    followers: getFollowers(userAddress).length,
  };
};

export default FollowButton;
