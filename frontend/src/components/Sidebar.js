import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useDisconnect, useWatchContractEvent } from 'wagmi';
import { TrendingUp, User, LogOut, Users } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import FollowButton from './FollowButton';
import contractData from '../contracts/SocialFeed.json';
import './Sidebar.css';

function Sidebar({ onHashtagClick }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [trendingTopics, setTrendingTopics] = useState([]);

  // Get recent posts to extract hashtags
  const { data: postsData } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getRecentPosts',
    args: [0n, 50n],
  });

  useEffect(() => {
    const extractHashtags = async () => {
      if (!postsData || !Array.isArray(postsData)) return;

      const hashtagCounts = {};

      // Extract hashtags from all posts
      for (const post of postsData) {
        if (!post.isActive) continue;

        try {
          const content = await getFromIPFS(post.ipfsHash);
          let textContent = '';

          if (typeof content === 'object' && content.content) {
            textContent = content.content;
          } else if (typeof content === 'string') {
            try {
              const parsed = JSON.parse(content);
              textContent = parsed.content || content;
            } catch {
              textContent = content;
            }
          }

          // Find all hashtags in the content
          const hashtags = textContent.match(/#[\w]+/g);
          if (hashtags) {
            hashtags.forEach(tag => {
              const normalizedTag = tag.toLowerCase();
              hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1;
            });
          }
        } catch (error) {
          console.error('Error extracting hashtags:', error);
        }
      }

      // Convert to array and sort by count
      const trending = Object.entries(hashtagCounts)
        .map(([tag, count]) => ({
          tag: tag,
          count: count,
          posts: `${count} ${count === 1 ? 'post' : 'posts'}`
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 trending

      setTrendingTopics(trending);
    };

    extractHashtags();
  }, [postsData]);

  // Track online users
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Mock suggested users (in real app, get from contract)
  const [suggestedUsers] = useState([
    { address: '0x1234567890123456789012345678901234567890', username: 'crypto_enthusiast', followers: 122, posts: 3 },
    { address: '0x2345678901234567890123456789012345678901', username: 'web3_builder', followers: 95, posts: 3 },
    { address: '0x3456789012345678901234567890123456789012', username: 'nft_collector', followers: 82, posts: 1 },
  ]);

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
      // This would be replaced with actual contract call
      setAllUsers(prev => [...prev, {
        address: userAddress,
        isOnline: Math.random() > 0.5, // Simulated online status
        lastSeen: Date.now()
      }]);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Update online status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate online status changes
      setAllUsers(prev => prev.map(user => ({
        ...user,
        isOnline: Math.random() > 0.3 // 70% chance of being online
      })));
    }, 30000); // Update every 30 seconds

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
      
      // Simulate online status
      setIsOnline(Math.random() > 0.3);
    }, [userProfile]);

    // Guard against undefined userAddress - after hooks
    if (!userAddress) return null;

    const username = userProfile?.displayName || formatAddress(userAddress);
    const isCurrentUser = address && userAddress?.toLowerCase() === address?.toLowerCase();

    if (isCurrentUser) return null; // Don't show current user

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
          <span className="online-user-status-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <FollowButton targetAddress={userAddress} />
      </div>
    );
  };

  return (
    <div className="sidebar">
      {/* Trending Topics */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <TrendingUp size={20} />
          Trending Topics
        </h3>
        <div className="trending-list">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic, index) => (
              <button
                key={index}
                className="trending-item"
                onClick={() => onHashtagClick && onHashtagClick(topic.tag)}
                title={`Click to see posts with ${topic.tag}`}
              >
                <div className="trending-tag">{topic.tag}</div>
                <div className="trending-count">{topic.posts}</div>
              </button>
            ))
          ) : (
            <div className="trending-empty">
              <p>No trending topics yet</p>
              <span>Use #hashtags in your posts!</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <User size={20} />
          Suggested Users
        </h3>
        <div className="suggested-users-list">
          {suggestedUsers.map((user, index) => (
            <div key={index} className="suggested-user-item">
              <div className="suggested-user-avatar">
                <User size={20} />
              </div>
              <div className="suggested-user-info">
                <div className="suggested-user-name">@{user.username}</div>
                <div className="suggested-user-stats">
                  {user.followers} followers • {user.posts} posts
                </div>
              </div>
              <FollowButton 
                targetAddress={user.address}
                targetUsername={user.username}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
