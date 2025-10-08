import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { getSuggestedUsers } from '../utils/suggestedUsers';
import FollowButton from './FollowButton';
import './SuggestedUsers.css';

const SuggestedUsers = ({ 
  currentUser, 
  allUsers, 
  allFollows, 
  allPosts,
  onFollowChange 
}) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSuggestions = useCallback(async () => {
    if (!currentUser || !address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const suggested = await getSuggestedUsers({
        currentUser: { ...currentUser, address },
        allUsers: allUsers || [],
        allFollows: allFollows || [],
        allPosts: allPosts || [],
        web3Provider: publicClient,
        limit: 5
      });

      setSuggestions(suggested);
    } catch (err) {
      console.error('Error loading suggested users:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [currentUser, address, allUsers, allFollows, allPosts, publicClient]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFollowChange = () => {
    if (onFollowChange) {
      onFollowChange();
    }
    // Refresh suggestions after follow action
    setTimeout(() => handleRefresh(), 1000);
  };

  const truncateBio = (bio, maxLength = 60) => {
    if (!bio) return 'No bio yet';
    return bio.length > maxLength ? bio.substring(0, maxLength) + '...' : bio;
  };

  const getReasonText = (user) => {
    if (user.mutualFollowers > 0) {
      return `${user.mutualFollowers} mutual follower${user.mutualFollowers > 1 ? 's' : ''}`;
    }
    if (user.score > 0.7) {
      return 'Shared interests';
    }
    if (user.postCount > 10) {
      return 'Active user';
    }
    return 'Suggested for you';
  };

  if (!address) {
    return null;
  }

  return (
    <div className="suggested-users">
      <div className="suggested-users-header">
        <h3>
          <span className="star-icon">✨</span>
          Suggested Users
        </h3>
        <button 
          className="refresh-btn" 
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh suggestions"
        >
          🔄
        </button>
      </div>

      {loading && (
        <div className="suggested-users-loading">
          <div className="loading-spinner"></div>
          <p>Finding cosmic connections...</p>
        </div>
      )}

      {error && (
        <div className="suggested-users-error">
          <p>{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <div className="suggested-users-empty">
          <p>🌟 No suggestions right now</p>
          <p className="empty-subtitle">Check back later for new connections!</p>
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="suggested-users-list">
          {suggestions.map((user, index) => (
            <div 
              key={user.address} 
              className="suggested-user-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="twinkling-stars"></div>
              
              <div className="user-card-content">
                <div className="user-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="avatar-glow"></div>
                </div>

                <div className="user-info">
                  <div className="user-header">
                    <h4 className="username">@{user.username || 'Anonymous'}</h4>
                    {user.score > 0.8 && (
                      <span className="high-match-badge" title="High match score">
                        ⭐
                      </span>
                    )}
                  </div>
                  
                  <p className="user-bio">{truncateBio(user.bio)}</p>
                  
                  <div className="user-meta">
                    <span className="reason-tag">
                      {getReasonText(user)}
                    </span>
                    {user.postCount > 0 && (
                      <span className="post-count">
                        {user.postCount} post{user.postCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="user-actions">
                  <FollowButton 
                    userAddress={user.address}
                    onFollowChange={handleFollowChange}
                  />
                </div>
              </div>

              <div className="card-shimmer"></div>
            </div>
          ))}
        </div>
      )}

      <div className="suggested-users-footer">
        <button className="see-more-btn" onClick={handleRefresh}>
          Discover More
        </button>
      </div>
    </div>
  );
};

export default SuggestedUsers;
