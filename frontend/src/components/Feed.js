import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { Loader2, RefreshCw, X } from 'lucide-react';
import Post from './Post';
import { getFromIPFS } from '../utils/ipfs';
import { contractData } from '../utils/contract';
import './Feed.css';

function Feed({ refreshTrigger, filterHashtag, searchQuery, filterByUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);
  const { isConnected, address } = useAccount();

  // Sync tabs with URL
  useEffect(() => {
    if (location.pathname === '/my-posts') {
      setShowMyPostsOnly(true);
      setShowFollowedOnly(false);
    } else if (location.pathname === '/following') {
      setShowFollowedOnly(true);
      setShowMyPostsOnly(false);
    } else if (location.pathname === '/all-posts' || location.pathname === '/feed' || location.pathname === '/') {
      setShowFollowedOnly(false);
      setShowMyPostsOnly(false);
    }
  }, [location.pathname]);

  // Read posts from contract
  const { data: postsData, isLoading, refetch, error } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getRecentPosts',
    args: [0n, 50n], // Offset: 0, Limit: 50
  });

  // Read following list from blockchain
  const { data: blockchainFollowing, refetch: refetchFollowing } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getFollowing',
    args: [address],
    enabled: !!address && isConnected,
  });

  useEffect(() => {
    console.log('🔍 Feed contract query:', {
      contractAddress: contractData.address,
      hasData: !!postsData,
      isLoading,
      error: error?.message
    });
  }, [postsData, isLoading, error]);

  // Log blockchain following data
  useEffect(() => {
    if (blockchainFollowing) {
      console.log('📊 Blockchain following data loaded:', {
        count: blockchainFollowing.length,
        addresses: blockchainFollowing
      });
    }
  }, [blockchainFollowing]);

  // Watch for new posts
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostCreated',
    onLogs() {
      setTimeout(() => {
        refetch();
      }, 1000);
    },
  });

  // Watch for post deletions
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostDeleted',
    onLogs() {
      refetch();
    },
  });

  // Watch for post likes
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostLiked',
    onLogs() {
      refetch();
    },
  });

  // Watch for post unlikes
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostUnliked',
    onLogs() {
      refetch();
    },
  });

  // Watch for follow events to refresh following list
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'UserFollowed',
    onLogs(logs) {
      // Check if event involves current user
      logs.forEach(log => {
        if (log.args.follower?.toLowerCase() === address?.toLowerCase()) {
          console.log('🔔 You followed someone, refreshing following list...');
          refetchFollowing();
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'UserUnfollowed',
    onLogs(logs) {
      // Check if event involves current user
      logs.forEach(log => {
        if (log.args.follower?.toLowerCase() === address?.toLowerCase()) {
          console.log('🔔 You unfollowed someone, refreshing following list...');
          refetchFollowing();
        }
      });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    await refetchFollowing(); // Also refresh following list from blockchain
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    // Clear old deleted posts from previous contract deployments
    // Since we have a new contract, old post IDs don't apply
    localStorage.removeItem('deleted_posts');
    setDeletedPosts([]);
    console.log('🗑️ Cleared old deleted posts list');
  }, []);

  useEffect(() => {
    if (postsData && Array.isArray(postsData)) {
      console.log('📊 Feed received', postsData.length, 'posts from blockchain');
      
      // Log each post to see why they're filtered
      postsData.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          id: post.id?.toString(),
          isActive: post.isActive,
          author: post.author
        });
      });
      
      const formattedPosts = postsData
        .map(post => ({
          id: post.id,
          author: post.author,
          ipfsHash: post.ipfsHash,
          timestamp: post.timestamp,
          likes: post.likes,
          isActive: post.isActive
        }))
        .filter(post => {
          const postIdStr = post.id?.toString();
          const isDeleted = deletedPosts.includes(postIdStr);
          const isActive = post.isActive;
          console.log(`Filtering post ${postIdStr}: isActive=${isActive}, isDeleted=${isDeleted}, willShow=${!isDeleted && isActive}`);
          return !isDeleted && isActive;
        })
        .sort((a, b) => {
          // Sort by timestamp descending (newest first)
          const timestampA = Number(a.timestamp);
          const timestampB = Number(b.timestamp);
          return timestampB - timestampA;
        });
      
      console.log('✅ Displaying', formattedPosts.length, 'posts');
      console.log('Deleted posts list:', deletedPosts);
      setPosts(formattedPosts);
    } else {
      console.log('⚠️ No posts data received');
      setPosts([]);
    }
  }, [postsData, refreshTrigger, deletedPosts]);

  // Filter posts by followed users or show all from registered users
  useEffect(() => {
    const filterPosts = async () => {
      if (!posts.length) {
        return;
      }

      if (showMyPostsOnly) {
        // Show only current user's posts
        const myPosts = posts.filter(post => 
          post.author.toLowerCase() === address?.toLowerCase()
        );
        console.log('📝 MY POSTS TAB - Showing only my posts:', myPosts.length);
        console.log('📝 Current user address:', address);
        setFilteredPosts(myPosts);
      } else if (showFollowedOnly) {
        // Show only posts from followed users (excluding own posts)
        // First try to get following list from blockchain
        let following = [];
        
        if (blockchainFollowing && Array.isArray(blockchainFollowing)) {
          // Use blockchain data as source of truth
          following = blockchainFollowing.map(addr => addr.toLowerCase());
          console.log('✅ Using following list from BLOCKCHAIN:', following.length, 'users');
        } else {
          // Fallback to localStorage if blockchain data not available
          const followingKey = `following_${address}`;
          following = JSON.parse(localStorage.getItem(followingKey) || '[]').map(addr => addr.toLowerCase());
          console.log('⚠️ Fallback to localStorage following list:', following.length, 'users');
        }
        
        console.log('👥 FOLLOWING TAB - Following list:', following);
        console.log('📝 Total posts:', posts.length);
        console.log('🚫 Excluding posts from:', address);
        
        const followedPosts = posts.filter(post => {
          // Exclude own posts
          if (post.author.toLowerCase() === address?.toLowerCase()) {
            console.log('🚫 Excluding my post:', post.id?.toString());
            return false;
          }
          
          const isFollowing = following.some(followedAddress => 
            followedAddress.toLowerCase() === post.author.toLowerCase()
          );
          
          if (isFollowing) {
            console.log('✅ Showing post from followed user:', post.author);
          }
          
          return isFollowing;
        });
        
        console.log('📊 FOLLOWING TAB - Filtered posts (excluding mine):', followedPosts.length);
        setFilteredPosts(followedPosts);
      } else {
        // Show all posts from OTHER users (never show own posts in main feed)
        console.log('📋 ALL POSTS TAB - Total posts:', posts.length);
        console.log('🚫 Current user address:', address);
        
        const postsFromOthers = posts.filter(post => {
          // ALWAYS exclude own posts in main feed
          const isMyPost = post.author.toLowerCase() === address?.toLowerCase();
          
          if (isMyPost) {
            console.log('🚫 Excluding my own post:', post.id?.toString());
            return false;
          }
          
          console.log('✅ Showing post from other user:', post.author);
          return true;
        });
        
        console.log('📊 ALL POSTS TAB - Posts from others (excluding mine):', postsFromOthers.length);
        setFilteredPosts(postsFromOthers);
      }
    };

    if (!filterHashtag && !searchQuery && !filterByUser) {
      filterPosts();
    }
  }, [posts, showFollowedOnly, showMyPostsOnly, address, filterHashtag, searchQuery, filterByUser, blockchainFollowing]);

  // Filter posts by hashtag, search query, or user
  useEffect(() => {
    const filterPosts = async () => {
      // Filter by user if specified
      if (filterByUser) {
        const userPosts = posts.filter(post => 
          post.author.toLowerCase() === filterByUser.toLowerCase()
        );
        setFilteredPosts(userPosts);
        return;
      }
      
      // If no filter or search, don't override the tab filtering
      if (!filterHashtag && !searchQuery) {
        return; // Let the tab filtering (My Posts, Following, All Posts) handle it
      }

      const filtered = [];
      for (const post of posts) {
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

          // Check if post contains the hashtag or search query
          const matchesHashtag = filterHashtag ? textContent.toLowerCase().includes(filterHashtag.toLowerCase()) : true;
          const matchesSearch = searchQuery ? textContent.toLowerCase().includes(searchQuery.toLowerCase()) : true;
          
          if (matchesHashtag && matchesSearch) {
            filtered.push(post);
          }
        } catch (error) {
          console.error('Error filtering post:', error);
        }
      }

      setFilteredPosts(filtered);
    };

    filterPosts();
  }, [posts, filterHashtag, searchQuery, filterByUser]);

  if (isLoading) {
    return (
      <div className="feed-loading">
        <Loader2 size={32} className="spinning" />
        <p>Loading posts...</p>
      </div>
    );
  }

  // Use filteredPosts for display (tab filtering is always applied)
  const displayPosts = filteredPosts;
  
  console.log('Feed: Display posts', {
    filterHashtag,
    searchQuery,
    showMyPostsOnly,
    showFollowedOnly,
    postsCount: posts.length,
    filteredPostsCount: filteredPosts.length,
    displayPostsCount: displayPosts.length,
    currentUserAddress: address
  });
  
  // Show message when searching
  const isSearching = searchQuery && searchQuery.length > 0;

  return (
    <div className="feed">
      <div className="feed-header">
        <div className="feed-header-top">
          <div>
            <h2>{searchQuery ? 'Search Results' : 'Feed'}</h2>
            <p className="feed-subtitle">
              {searchQuery 
                ? `Found ${displayPosts.length} post${displayPosts.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : filterHashtag 
                  ? `Posts with ${filterHashtag}` 
                  : showMyPostsOnly
                    ? 'Your posts'
                    : showFollowedOnly 
                      ? 'Posts from people you follow' 
                      : 'Latest updates from your Web3 community'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {filterHashtag && (
              <button 
                className="btn-clear-filter"
                onClick={() => window.location.reload()}
                title="Clear filter"
              >
                <X size={16} />
                Clear
              </button>
            )}
            <button 
              className="btn-clear-cache"
              onClick={() => {
                if (window.confirm('Clear all cached data? This will reload the page.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              title="Clear cache and reload"
            >
              🗑️
            </button>
            <button 
              className="btn-refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh feed"
            >
              <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
            </button>
          </div>
        </div>
        
        {/* Feed Filter Tabs */}
        {isConnected && (
          <div className="feed-tabs">
            <button 
              className={`feed-tab ${!showFollowedOnly && !showMyPostsOnly ? 'active' : ''}`}
              onClick={() => {
                navigate('/all-posts');
                setShowFollowedOnly(false);
                setShowMyPostsOnly(false);
              }}
            >
              All Posts
            </button>
            <button 
              className={`feed-tab ${showFollowedOnly ? 'active' : ''}`}
              onClick={() => {
                navigate('/following');
                setShowFollowedOnly(true);
                setShowMyPostsOnly(false);
              }}
            >
              Following
            </button>
            <button 
              className={`feed-tab ${showMyPostsOnly ? 'active' : ''}`}
              onClick={() => {
                navigate('/my-posts');
                setShowMyPostsOnly(true);
                setShowFollowedOnly(false);
              }}
              title="View your posts"
            >
              My Posts
            </button>
          </div>
        )}
      </div>

      {displayPosts.length === 0 ? (
        <div className="empty-feed">
          <div className="empty-feed-icon">{isSearching ? '🔍' : '📝'}</div>
          <h3>{isSearching ? 'No posts found' : 'No posts yet'}</h3>
          <p>
            {isSearching
              ? `No posts matching "${searchQuery}". User profiles are searched separately - check if the username exists by looking at the Suggested Users sidebar or try a different search term.`
              : filterHashtag 
                ? `No posts found with ${filterHashtag}`
                : isConnected 
                  ? "This is a fresh contract! Be the first to post something!" 
                  : "Connect your wallet to see posts"}
          </p>
          {isConnected && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
                💡 <strong>Note:</strong> This is a new contract deployment. You may need to:
                <br />1. Create your profile first (click profile icon)
                <br />2. Wait 5-10 seconds after posting
                <br />3. Click the refresh button (🔄) above
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="feed-posts">
          {displayPosts.map((post) => (
            <Post 
              key={post.id.toString()} 
              post={post}
              onDelete={(postId) => {
                setDeletedPosts([...deletedPosts, postId.toString()]);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Feed;
