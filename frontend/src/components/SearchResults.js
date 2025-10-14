import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { X, User, FileText, Users } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';
import { contractData } from '../utils/contract';
import FollowButton from './FollowButton';
import { getFromIPFS } from '../utils/ipfs';
import './SearchResults.css';

function SearchResults({ isOpen, onClose, results, searchQuery }) {
  const { address } = useAccount();
  const [postsWithUsernames, setPostsWithUsernames] = useState([]);
  
  const { posts = [], users = [] } = results;
  const totalResults = posts.length + users.length;

  // Component to display user result with follow button and stats
  const UserResultItem = ({ user, currentUserAddress }) => {
    const [profileImage, setProfileImage] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // Get user's full profile from blockchain
    const { data: userProfile } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getUserProfile',
      args: [user.address],
      enabled: !!user.address,
    });

    // Get follower count from blockchain
    const { data: followers } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getFollowers',
      args: [user.address],
      enabled: !!user.address,
    });

    // Get following count from blockchain
    const { data: following } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getFollowing',
      args: [user.address],
      enabled: !!user.address,
    });

    // Load profile image from IPFS
    useEffect(() => {
      const loadProfileImage = async () => {
        if (userProfile && userProfile.profileIpfsHash) {
          try {
            const profileData = await getFromIPFS(userProfile.profileIpfsHash);
            if (profileData && profileData.image) {
              setProfileImage(profileData.image);
            }
          } catch (error) {
            console.error('Error loading profile image:', error);
          }
        }
      };
      loadProfileImage();
    }, [userProfile]);

    // Update follower/following counts from blockchain
    useEffect(() => {
      if (followers) {
        setFollowerCount(followers.length);
      }
    }, [followers]);

    useEffect(() => {
      if (following) {
        setFollowingCount(following.length);
      }
    }, [following]);

    return (
      <div className="result-item user-result-item">
        <div className="user-result-avatar">
          {profileImage ? (
            <img src={profileImage} alt={user.username} />
          ) : (
            <User size={24} />
          )}
        </div>
        <div className="result-content">
          <p className="result-username">@{user.username}</p>
          <div className="user-stats">
            <span className="stat-item">
              <Users size={14} />
              {followerCount} followers
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              {followingCount} following
            </span>
          </div>
        </div>
        {currentUserAddress && currentUserAddress.toLowerCase() !== user.address.toLowerCase() && (
          <div className="user-result-actions">
            <FollowButton 
              targetAddress={user.address}
              targetUsername={user.username}
              size="small"
            />
          </div>
        )}
      </div>
    );
  };

  // Component to fetch and display username for each post
  const PostResultItem = ({ post, onClick }) => {
    const { data: authorProfile } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getUserProfile',
      args: [post.author],
    });

    const username = authorProfile?.displayName || 'Anonymous';

    // Highlight matched text
    const highlightText = (text, query) => {
      if (!query) return text;
      
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="highlight-match">{part}</mark>
        ) : (
          part
        )
      );
    };

    return (
      <div className="result-item" onClick={onClick}>
        <div className="result-icon">
          <FileText size={16} />
        </div>
        <div className="result-content">
          <p className="result-text">
            {post.searchQuery ? highlightText(post.content, post.searchQuery) : post.content}
          </p>
          <div className="result-meta">
            <span className="result-author">@{username}</span>
            <span>•</span>
            <span>{formatTimestamp(post.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="search-results-dropdown">
      <div className="search-results-header">
        <h3>Search Results for "{searchQuery}"</h3>
        <button className="btn-close-search-dropdown" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="search-results-content">
          {totalResults === 0 ? (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <span>Try searching for something else</span>
            </div>
          ) : (
            <>
              {/* Posts Results */}
              {posts.length > 0 && (
                <div className="results-section">
                  <h3>
                    <FileText size={18} />
                    Posts ({posts.length})
                  </h3>
                  <div className="results-list">
                    {posts.map((post) => (
                      <PostResultItem
                        key={post.id.toString()}
                        post={post}
                        onClick={() => {
                          // Close search modal
                          onClose();
                          // Scroll to the post in feed or show it
                          const postElement = document.querySelector(`[data-post-id="${post.id.toString()}"]`);
                          if (postElement) {
                            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Highlight the post briefly
                            postElement.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.5)';
                            setTimeout(() => {
                              postElement.style.boxShadow = '';
                            }, 2000);
                          } else {
                            // If post not in view, reload page and scroll
                            window.location.href = `#post-${post.id.toString()}`;
                            window.location.reload();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {users.length > 0 && (
                <div className="results-section">
                  <h3>
                    <User size={18} />
                    Users ({users.length})
                  </h3>
                  <div className="results-list">
                    {users.map((user, index) => (
                      <UserResultItem
                        key={index}
                        user={user}
                        currentUserAddress={address}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
    </div>
  );
}

export default SearchResults;
