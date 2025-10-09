import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { TrendingUp, User } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import FollowButton from './FollowButton';
import SuggestedUsers from './SuggestedUsers';
import { contractData } from '../utils/contract';
import './Sidebar.css';

function Sidebar({ onHashtagClick }) {
  const { address, isConnected } = useAccount();
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
      const now = Date.now() / 1000;
      const sevenDaysAgo = now - (7 * 24 * 60 * 60); // Last 7 days

      // Extract hashtags from recent posts only
      for (const post of postsData) {
        if (!post.isActive) continue;

        // Only count recent posts for trending
        const postTime = Number(post.timestamp);
        if (postTime < sevenDaysAgo) continue;

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

      // Convert to array and sort by count (most recent trending)
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

    // Auto-refresh trending topics every 30 seconds
    const interval = setInterval(() => {
      extractHashtags();
    }, 30000);

    return () => clearInterval(interval);
  }, [postsData]);

  // Track online users
  const [allUsers, setAllUsers] = useState([]);

  // Get current user profile for suggestions
  const { data: currentUserProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Prepare data for suggested users
  const [allUsersForSuggestions, setAllUsersForSuggestions] = useState([]);
  const [allFollows, setAllFollows] = useState([]);

  // Extract users from posts
  useEffect(() => {
    if (!postsData || !Array.isArray(postsData)) return;

    const uniqueAddresses = [...new Set(postsData.map(post => post.author))];
    const users = uniqueAddresses.map(addr => ({
      address: addr,
      username: addr.slice(0, 6) + '...' + addr.slice(-4),
      bio: '',
      profileImage: null
    }));

    setAllUsersForSuggestions(users);

    // Get follows from localStorage
    const followingKey = `following_${address}`;
    const following = JSON.parse(localStorage.getItem(followingKey) || '[]');
    const followsData = following.map(addr => ({
      follower: address,
      following: addr
    }));
    setAllFollows(followsData);
  }, [postsData, address]);

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
      {isConnected && currentUserProfile && (
        <SuggestedUsers 
          currentUser={currentUserProfile}
          allUsers={allUsersForSuggestions}
          allFollows={allFollows}
          allPosts={postsData || []}
          onFollowChange={() => {
            // Refresh follows data
            const followingKey = `following_${address}`;
            const following = JSON.parse(localStorage.getItem(followingKey) || '[]');
            const followsData = following.map(addr => ({
              follower: address,
              following: addr
            }));
            setAllFollows(followsData);
          }}
        />
      )}
    </div>
  );
}

export default Sidebar;
