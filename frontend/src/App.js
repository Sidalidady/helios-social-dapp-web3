import React, { useState, useEffect } from 'react';
import { WagmiProvider, useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrendingUp, Users } from 'lucide-react';
import { config } from './config/wagmi';
import { useAutoSwitchNetwork } from './hooks/useAutoSwitchNetwork';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import CreatePost from './components/CreatePost';
import Feed from './components/Feed';
import Profile from './components/ProfileNew';
import WalletConnect from './components/WalletConnect';
import Sidebar from './components/Sidebar';
import Registration from './components/Registration';
import WelcomeBack from './components/WelcomeBack';
import WelcomeChoice from './components/WelcomeChoice';
import LoginSuccess from './components/LoginSuccess';
import AllUsers from './components/OnlineUsers';
import SunLogo from './components/SunLogo';
import NetworkSwitcher from './components/NetworkSwitcher';
import { getFromIPFS } from './utils/ipfs';
import { contractData } from './utils/contract';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showWelcomeChoice, setShowWelcomeChoice] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const [welcomeImage, setWelcomeImage] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [showProfileInFeed, setShowProfileInFeed] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUsers, setSearchUsers] = useState([]);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  
  // Automatically switch to Helios Testnet when wallet connects
  useAutoSwitchNetwork();
  
  // IMMEDIATE network check and switch on connect
  useEffect(() => {
    const ensureHeliosNetwork = async () => {
      if (isConnected && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log('🌐 Current network:', chainId);
          
          if (chainId !== '0xa410') { // Not on Helios Testnet
            console.log('⚠️ Wrong network detected, switching to Helios Testnet...');
            
            try {
              // Try to switch to Helios
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xa410' }],
              });
              console.log('✅ Switched to Helios Testnet!');
            } catch (switchError) {
              // If network doesn't exist (error 4902), add it
              if (switchError.code === 4902) {
                console.log('📡 Helios Testnet not found, adding it...');
                
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: '0xa410', // 42000 in decimal
                      chainName: 'Helios Testnet',
                      nativeCurrency: {
                        name: 'Helios',
                        symbol: 'HLS',
                        decimals: 18
                      },
                      rpcUrls: ['https://testnet1.helioschainlabs.org'],
                      blockExplorerUrls: ['https://explorer.helioschainlabs.org']
                    }]
                  });
                  console.log('✅ Helios Testnet added and switched successfully!');
                } catch (addError) {
                  console.error('❌ Failed to add Helios Testnet:', addError);
                  if (addError.code === 4001) {
                    console.log('User rejected adding network');
                  }
                }
              } else if (switchError.code === 4001) {
                console.log('User rejected network switch');
              } else {
                console.error('❌ Failed to switch network:', switchError);
              }
            }
          } else {
            console.log('✅ Already on Helios Testnet');
          }
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };
    
    ensureHeliosNetwork();
  }, [isConnected]);
  
  // Clear stale wagmi storage on mount to prevent connection issues
  useEffect(() => {
    if (!isConnected && !isConnecting && !isReconnecting) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('wagmi.')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [isConnected, isConnecting, isReconnecting]);

  // Handle account changes - reset state when address changes
  useEffect(() => {
    if (address) {
      // Reset profile check when address changes
      setHasCheckedProfile(false);
      setShowProfileInFeed(false);
      setViewingUserProfile(null);
    }
  }, [address]);

  // Close wallet modal when connected, open it when disconnected
  useEffect(() => {
    if (isConnected) {
      setShowWalletConnect(false);
    } else if (!isConnecting && !isReconnecting) {
      // When disconnected, ensure we're back to welcome state
      setShowWalletConnect(false);
    }
  }, [isConnected, isConnecting, isReconnecting]);
  
  // Write contract for follow/unfollow
  const { writeContract, data: followHash, isPending: isFollowPending } = useWriteContract();
  const { isLoading: isFollowConfirming } = useWaitForTransactionReceipt({ 
    hash: followHash 
  });

  // Read all posts for counting
  const { data: allPosts } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getAllPosts',
    enabled: isConnected,
  });

  // Watch for ProfileUpdated events to track all registered users
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'ProfileUpdated',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const userAddress = log.args.user;
        if (userAddress) {
          // Get existing registered users
          const stored = localStorage.getItem('all_registered_users');
          const registeredUsers = stored ? JSON.parse(stored) : [];
          
          // Add new user if not already in list
          if (!registeredUsers.includes(userAddress.toLowerCase())) {
            registeredUsers.push(userAddress.toLowerCase());
            localStorage.setItem('all_registered_users', JSON.stringify(registeredUsers));
            console.log('👤 New user registered:', userAddress);
            console.log('📋 Total registered users:', registeredUsers.length);
          }
        }
      });
    }
  });

  // Read user's profile
  const { data: userProfile, refetch: refetchProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Check if user has a profile when they connect
  useEffect(() => {
    const checkProfile = async () => {
      if (isConnected && address && !hasCheckedProfile && !isConnecting && !isReconnecting) {
        console.log('🔍 Checking if user has profile...');
        console.log('Address:', address);
        
        // First, ensure user is on Helios Testnet
        if (window.ethereum) {
          try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log('Current chain ID:', chainId);
            
            if (chainId !== '0xa410') { // 0xa410 = 42000 in hex
              console.log('⚠️ Not on Helios Testnet, switching...');
              
              try {
                // Try to switch
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0xa410' }],
                });
                console.log('✅ Switched to Helios Testnet');
              } catch (switchError) {
                // If network doesn't exist, add it
                if (switchError.code === 4902) {
                  console.log('Network not found, adding Helios Testnet...');
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: '0xa410',
                      chainName: 'Helios Testnet',
                      nativeCurrency: {
                        name: 'Helios',
                        symbol: 'HLS',
                        decimals: 18
                      },
                      rpcUrls: ['https://testnet1.helioschainlabs.org'],
                      blockExplorerUrls: ['https://explorer.helioschainlabs.org']
                    }]
                  });
                  console.log('✅ Helios Testnet added and switched!');
                }
              }
            }
          } catch (error) {
            console.error('Error checking/switching network:', error);
          }
        }
        
        // Wait a bit for profile data to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refetch profile to ensure we have latest data
        await refetchProfile();
        
        console.log('Profile data:', userProfile);
        
        const hasProfile = userProfile?.exists && userProfile?.displayName?.length > 0;
        console.log('Has profile?', hasProfile);
        
        if (hasProfile) {
          // ✅ User has existing profile - auto login
          const username = userProfile.displayName;
          const ipfsHash = userProfile.profileIpfsHash;
          
          console.log('✅ Existing profile found:', username);
          setWelcomeUsername(username);
          
          // Load profile image if available
          if (ipfsHash && ipfsHash.length > 0) {
            try {
              const profileData = await getFromIPFS(ipfsHash);
              if (profileData && profileData.image) {
                setWelcomeImage(profileData.image);
              }
            } catch (error) {
              console.error('Error loading profile image:', error);
            }
          }
          
          // Show welcome back animation
          setShowLoginSuccess(true);
          
          // Note: Online status heartbeat disabled to save gas
          // Status is updated automatically when user interacts (posts, likes, etc.)
          
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setShowLoginSuccess(false);
          }, 3000);
        } else {
          // ❌ No profile - must create one first
          console.log('⚠️ No profile found - MUST CREATE PROFILE');
          setShowWelcomeChoice(false);
          setShowRegistration(true); // Force registration - NO SKIP!
        }
        
        setHasCheckedProfile(true);
      }

      // Reset check when disconnected
      if (!isConnected && !isConnecting && !isReconnecting) {
        setHasCheckedProfile(false);
        setShowWelcomeChoice(false);
        setShowRegistration(false);
        setShowWelcomeBack(false);
        setShowLoginSuccess(false);
        setWelcomeUsername('');
        setWelcomeImage('');
        setShowProfileInFeed(false);
        setViewingUserProfile(null);
        setSearchQuery('');
        setSearchUsers([]);
      }
    };
    
    checkProfile();
  }, [isConnected, isConnecting, isReconnecting, address, userProfile, hasCheckedProfile]);

  const handleCreateAccount = () => {
    setShowWelcomeChoice(false);
    setShowRegistration(true);
  };

  const handleLogin = () => {
    setShowWelcomeChoice(false);
    // Just close and let user browse
  };

  const handlePostCreated = () => {
    // Trigger feed refresh
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRegistrationComplete = async () => {
    console.log('🎉 Registration completed! Reloading profile...');
    setShowRegistration(false);
    
    // Reset the check flag so it re-checks the profile
    setHasCheckedProfile(false);
    
    // Wait a bit for blockchain to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Refetch profile
    await refetchProfile();
    
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSkipRegistration = () => {
    setShowRegistration(false);
    // Go back to choice screen
    setShowWelcomeChoice(true);
  };

  return (
    <div className="app">
      {/* Network Switcher - shows when on wrong network */}
      {isConnected && <NetworkSwitcher />}
      
      {/* Header - only visible when connected */}
      {isConnected && (
        <Header 
          onProfileClick={() => setShowProfileInFeed(true)}
          onConnectClick={() => {
            if (!isConnected) {
              setShowWalletConnect(true);
            }
          }}
          onSearch={(query, users) => {
            setSearchQuery(query);
            setSearchUsers(users || []);
            setShowProfileInFeed(false);
            setShowWalletConnect(false);
          }}
        />
      )}
      
      {/* Wallet Connect Modal */}
      {showWalletConnect && (
        <WalletConnect onClose={() => setShowWalletConnect(false)} />
      )}
      
      {/* Only show UI when connected */}
      {!isConnected && !isConnecting && !isReconnecting ? (
        // Disconnected state - show only background and connect prompt
        <div className="disconnected-overlay">
          <div className="connect-prompt">
            <div className="connect-prompt-logo">
              <div className="logo-container">
                <SunLogo />
              </div>
              <div className="logo-glow"></div>
            </div>
            <h1>Welcome to Helios Social</h1>
            <p className="tagline">Your Decentralized Social Network</p>
            <p className="subtitle">Connect your Web3 wallet to join the community</p>
            <button 
              onClick={() => setShowWalletConnect(true)} 
              className="btn-connect-large"
            >
              <svg className="wallet-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
              </svg>
              Connect Wallet
            </button>
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Lightning Fast</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span>Fully Decentralized</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Connected state - show full UI
        <>
          
          <main className="main-content">
            <div className="container-with-sidebar">
              <LeftSidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              if (tab === 'feed') {
                setActiveTab('feed');
                setSelectedHashtag(null);
                setShowProfileInFeed(false);
                setViewingUserProfile(null);
              } else if (tab === 'trending') {
                setActiveTab('trending');
                setShowProfileInFeed(false);
                setViewingUserProfile(null);
                setSelectedHashtag(null);
              } else if (tab === 'communities') {
                // Don't change activeTab, keep Feed active
                setShowProfileInFeed(false);
                setViewingUserProfile(null);
                setSelectedHashtag(null);
                setShowCommunitiesModal(true);
              }
            }}
            onProfileClick={() => {
              // Don't change activeTab, keep Feed active
              setShowProfileInFeed(true);
            }}
          />
          <div className="main-feed">
            {showWalletConnect ? (
              <WalletConnect onClose={() => setShowWalletConnect(false)} />
            ) : viewingUserProfile ? (
              (() => {
                // Calculate stats
                const userPostCount = allPosts?.filter(p => 
                  p.author.toLowerCase() === viewingUserProfile.address.toLowerCase() && p.isActive
                ).length || 0;
                
                // Get follower count from localStorage (you can replace with blockchain data)
                const followersKey = `followers_${viewingUserProfile.address}`;
                const followerCount = JSON.parse(localStorage.getItem(followersKey) || '[]').length;
                
                return (
                  <div className="user-profile-view">
                    <div className="user-profile-header">
                      <button 
                        onClick={() => setViewingUserProfile(null)} 
                        className="btn-back"
                      >
                        ← Back to Feed
                      </button>
                      <div className="user-profile-info-header">
                        <div className="user-profile-avatar-large">
                          {viewingUserProfile.profileImage ? (
                            <img src={viewingUserProfile.profileImage} alt={viewingUserProfile.username} />
                          ) : (
                            <div className="user-profile-avatar-placeholder-large">
                              {viewingUserProfile.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="user-profile-details">
                          <h2>{viewingUserProfile.username}</h2>
                          {viewingUserProfile.bio && <p className="user-profile-bio">{viewingUserProfile.bio}</p>}
                          
                          {/* Stats */}
                          <div className="user-profile-stats">
                            <span className="profile-stat">
                              <strong>{userPostCount}</strong> {userPostCount === 1 ? 'post' : 'posts'}
                            </span>
                            <span className="profile-stat-separator">•</span>
                            <span className="profile-stat">
                              <strong>{followerCount}</strong> {followerCount === 1 ? 'follower' : 'followers'}
                            </span>
                          </div>
                      
                          {/* Follow Button */}
                          {address && address.toLowerCase() !== viewingUserProfile.address.toLowerCase() && (
                            <button 
                              className={`btn-follow-profile ${isFollowing ? 'following' : ''}`}
                              disabled={isFollowPending || isFollowConfirming}
                              onClick={() => {
                                const newFollowState = !isFollowing;
                                
                                // Call blockchain follow/unfollow
                                try {
                                  writeContract({
                                    address: contractData.address,
                                    abi: contractData.abi,
                                    functionName: newFollowState ? 'followUser' : 'unfollowUser',
                                    args: [viewingUserProfile.address],
                                  });
                                  
                                  setIsFollowing(newFollowState);
                                  
                                  // Update local storage
                                  const followingKey = `following_${address}`;
                                  const following = JSON.parse(localStorage.getItem(followingKey) || '[]');
                                  
                                  if (newFollowState) {
                                    if (!following.includes(viewingUserProfile.address)) {
                                      following.push(viewingUserProfile.address);
                                      localStorage.setItem(followingKey, JSON.stringify(following));
                                    }
                                  } else {
                                    const updated = following.filter(f => f !== viewingUserProfile.address);
                                    localStorage.setItem(followingKey, JSON.stringify(updated));
                                  }
                                  
                                  // Force re-render
                                  setViewingUserProfile({...viewingUserProfile});
                                } catch (error) {
                                  console.error('Error following/unfollowing user:', error);
                                }
                              }}
                            >
                              {isFollowPending || isFollowConfirming ? 'Processing...' : (isFollowing ? 'Unfollow' : 'Follow')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="user-posts-title">Posts by {viewingUserProfile.username}</h3>
                    <Feed 
                      refreshTrigger={refreshTrigger} 
                      filterByUser={viewingUserProfile.address}
                    />
                  </div>
                );
              })()
            ) : showProfileInFeed ? (
              <Profile onClose={() => setShowProfileInFeed(false)} />
            ) : activeTab === 'trending' ? (
              <div className="trending-view">
                <h2 className="trending-view-title">
                  <TrendingUp size={24} />
                  Trending Topics
                </h2>
                <p className="trending-view-subtitle">
                  Discover what's popular in the community
                </p>
                <Feed 
                  refreshTrigger={refreshTrigger}
                  filterHashtag={null}
                  showTrending={true}
                />
              </div>
            ) : searchQuery ? (
              <div className="search-results-container">
                <div className="search-results-header">
                  <h2>Search Results for "{searchQuery}"</h2>
                  <button onClick={() => {
                    setSearchQuery('');
                    setSearchUsers([]);
                  }} className="btn-close-search">
                    ✕ Clear Search
                  </button>
                </div>
                
                {/* Display User Results */}
                {console.log('🔍 Search Users in App:', searchUsers)}
                {searchUsers && searchUsers.length > 0 ? (
                  <div className="search-users-section">
                    <h3 className="search-section-title">👥 Users ({searchUsers.length})</h3>
                    <div className="search-users-grid">
                      {searchUsers.map((user) => {
                        // Get post count from user's profile data (same as Profile component)
                        const postCount = user.postCount || 0;
                        
                        // Get follower count from user's profile data (same as Profile component)
                        const followerCount = user.followerCount || 0;
                        
                        // Check if current user is following this user
                        const followingKey = `following_${address}`;
                        const following = JSON.parse(localStorage.getItem(followingKey) || '[]');
                        const isFollowingUser = following.includes(user.address);
                        
                        return (
                          <div 
                            key={user.address} 
                            className="search-user-card"
                          >
                            <div 
                              className="search-user-main"
                              onClick={() => {
                                // Show user's profile and posts
                                setViewingUserProfile(user);
                                setSearchQuery('');
                                setSearchUsers([]);
                              }}
                            >
                              <div className="search-user-avatar">
                                {user.profileImage ? (
                                  <img src={user.profileImage} alt={user.username} />
                                ) : (
                                  <div className="search-user-avatar-placeholder">
                                    {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                  </div>
                                )}
                              </div>
                              <div className="search-user-info">
                                <h4 className="search-user-name">{user.username}</h4>
                                
                                {/* Stats */}
                                <div className="search-user-stats">
                                  <span className="user-stat">
                                    <strong>{postCount}</strong> {postCount === 1 ? 'post' : 'posts'}
                                  </span>
                                  <span className="user-stat-separator">•</span>
                                  <span className="user-stat">
                                    <strong>{followerCount}</strong> {followerCount === 1 ? 'follower' : 'followers'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Follow Button - Always show for testing */}
                            <button 
                              className={`btn-follow-search ${isFollowingUser ? 'following' : ''}`}
                              disabled={isFollowPending || isFollowConfirming}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newFollowState = !isFollowingUser;
                                
                                // Call blockchain follow/unfollow
                                try {
                                  writeContract({
                                    address: contractData.address,
                                    abi: contractData.abi,
                                    functionName: newFollowState ? 'followUser' : 'unfollowUser',
                                    args: [user.address],
                                  });
                                  
                                  // Update local storage
                                  const followingKey = `following_${address}`;
                                  const following = JSON.parse(localStorage.getItem(followingKey) || '[]');
                                  
                                  if (newFollowState) {
                                    if (!following.includes(user.address)) {
                                      following.push(user.address);
                                      localStorage.setItem(followingKey, JSON.stringify(following));
                                    }
                                  } else {
                                    const updated = following.filter(f => f !== user.address);
                                    localStorage.setItem(followingKey, JSON.stringify(updated));
                                  }
                                  
                                  // Force re-render
                                  setSearchUsers([...searchUsers]);
                                } catch (error) {
                                  console.error('Error following/unfollowing user:', error);
                                }
                              }}
                            >
                              {isFollowPending || isFollowConfirming ? (
                                <span>Processing...</span>
                              ) : (
                                isFollowingUser ? 'Unfollow' : 'Follow'
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="search-users-section">
                    <h3 className="search-section-title">👥 Users</h3>
                    <p style={{color: '#94a3b8', padding: '1rem', textAlign: 'center'}}>
                      Searching for users matching "{searchQuery}"... 
                      {searchUsers && searchUsers.length === 0 && ' No users found.'}
                    </p>
                  </div>
                )}
                
                {/* Display Post Results */}
                <div className="search-posts-section">
                  <h3 className="search-section-title">📝 Posts</h3>
                  <Feed refreshTrigger={refreshTrigger} filterHashtag={selectedHashtag} searchQuery={searchQuery} />
                </div>
              </div>
            ) : (
              <>
                <CreatePost onPostCreated={handlePostCreated} />
                <Feed refreshTrigger={refreshTrigger} filterHashtag={selectedHashtag} />
              </>
            )}
          </div>
          <div className="right-sidebar-container">
            <Sidebar onHashtagClick={(hashtag) => {
              setSelectedHashtag(hashtag);
              setActiveTab('trending');
            }} />
          </div>
        </div>
      </main>

      {showWelcomeChoice && isConnected && (
        <WelcomeChoice 
          onCreateAccount={handleCreateAccount}
          onLogin={handleLogin}
        />
      )}

      {showRegistration && isConnected && (
        <Registration 
          address={address}
          onComplete={handleRegistrationComplete}
          onSkip={null}
          isFirstTime={true}
        />
      )}

      {showLoginSuccess && (
        <LoginSuccess 
          username={welcomeUsername}
          onComplete={() => setShowLoginSuccess(false)}
        />
      )}

      {showWelcomeBack && (
        <WelcomeBack 
          username={welcomeUsername}
          profileImage={welcomeImage}
          onClose={() => setShowWelcomeBack(false)}
        />
      )}

      {/* Twitter Profile Button */}
      <a 
        href="https://x.com/dadi91429" 
        target="_blank" 
        rel="noopener noreferrer"
        className="twitter-profile-button"
        title="Follow @dadi91429 on X (Twitter)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* Communities Modal */}
      {showCommunitiesModal && (
        <div className="communities-modal-overlay" onClick={() => setShowCommunitiesModal(false)}>
          <div className="communities-modal" onClick={(e) => e.stopPropagation()}>
            <div className="communities-modal-header">
              <h2>
                <Users size={24} />
                Users on dApp
              </h2>
              <button 
                className="communities-modal-close" 
                onClick={() => setShowCommunitiesModal(false)}
              >
                ✕
              </button>
            </div>
            <p className="communities-modal-subtitle">
              Connect with active members of the community
            </p>
            <div className="communities-modal-content">
              <AllUsers expanded={true} />
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
