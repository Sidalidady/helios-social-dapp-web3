import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWatchContractEvent } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { formatAddress } from '../utils/formatters';
import { Wallet, LogOut, User, X, Search, Sun, Moon, Bell, Menu, Home, TrendingUp, Users } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import Profile from './Profile';
import Notifications, { getUnreadCount } from './Notifications';
import SearchResults from './SearchResults';
import SunLogo from './SunLogo';
import { contractData } from '../utils/contract';
import { config } from '../config/wagmi';
import './Header.css';

function Header({ onProfileClick, onConnectClick, onSearch }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('feed');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Read user's profile
  const { data: userProfile, refetch: refetchProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address,
  });

  // Watch for profile updates
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'ProfileUpdated',
    onLogs(logs) {
      // Refetch profile when any profile is updated
      refetchProfile();
    },
  });

  useEffect(() => {
    // Set username and load profile image
    const loadProfile = async () => {
      if (userProfile && userProfile.displayName && userProfile.displayName.length > 0) {
        const username = userProfile.displayName;
        const ipfsHash = userProfile.profileIpfsHash;
        
        console.log('📸 Header - Loading profile:', { username, ipfsHash });
        setUsername(username);
        
        // Load profile image from IPFS if available
        if (ipfsHash && ipfsHash.length > 0 && ipfsHash !== '0x' && ipfsHash !== '') {
          try {
            console.log('📥 Header - Fetching profile image from IPFS:', ipfsHash);
            const profileData = await getFromIPFS(ipfsHash);
            console.log('📋 Header - Profile data received:', profileData);
            
            if (profileData && profileData.image) {
              console.log('✅ Header - Setting profile image');
              setProfileImage(profileData.image);
            } else {
              console.warn('⚠️ Header - No image in profile data');
              setProfileImage('');
            }
          } catch (error) {
            console.error('❌ Header - Error loading profile image:', error);
            setProfileImage('');
          }
        } else {
          console.log('ℹ️ Header - No IPFS hash, using default icon');
          setProfileImage('');
        }
      } else {
        setUsername('');
        setProfileImage('');
      }
    };
    
    loadProfile();
  }, [userProfile]);

  // Update unread count
  useEffect(() => {
    if (address) {
      const count = getUnreadCount(address);
      setUnreadCount(count);
      
      // Check for updates every 10 seconds
      const interval = setInterval(() => {
        const newCount = getUnreadCount(address);
        setUnreadCount(newCount);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [address, showNotifications]);

  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleConnect = async (connector) => {
    try {
      console.log('Connecting with connector:', connector);
      await connect({ connector });
      setShowWalletModal(false);
    } catch (err) {
      console.error('Connection error:', err);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const getWalletIcon = (connectorName) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return '🦊';
    if (name.includes('rabby')) return '🐰';
    if (name.includes('okx')) return '⭕';
    if (name.includes('walletconnect')) return '🔗';
    return '👛';
  };

  const getWalletName = (connector) => {
    const name = connector.name.toLowerCase();
    const id = connector.id.toLowerCase();
    
    if (name.includes('metamask') || id.includes('metamask')) return 'MetaMask';
    if (name.includes('rabby') || id.includes('rabby')) return 'Rabby Wallet';
    if (name.includes('okx') || id.includes('okx')) return 'OKX Wallet';
    if (name.includes('walletconnect') || id.includes('walletconnect')) return 'WalletConnect';
    if (name.includes('injected') || id.includes('injected')) return 'Browser Wallet';
    return connector.name;
  };

  const isWalletAvailable = (connector) => {
    // WalletConnect is always available
    if (connector.name.toLowerCase().includes('walletconnect')) {
      return true;
    }
    
    // Check if window.ethereum exists for injected wallets
    if (typeof window !== 'undefined' && window.ethereum) {
      const name = connector.name.toLowerCase();
      const id = connector.id.toLowerCase();
      
      // Check for specific wallet providers
      if (name.includes('metamask') || id.includes('metamask')) {
        return window.ethereum.isMetaMask === true;
      }
      if (name.includes('rabby') || id.includes('rabby')) {
        return window.ethereum.isRabby === true;
      }
      if (name.includes('okx') || id.includes('okx')) {
        return window.ethereum.isOkxWallet === true || window.okxwallet !== undefined;
      }
      // Generic injected wallet
      return true;
    }
    
    return false;
  };

  if (error) {
    console.error('Wagmi connection error:', error);
  }

  // Get all posts for search (using smaller limit to avoid contract error)
  const { data: allPosts, refetch: refetchPosts, isLoading: postsLoading, error: postsError } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getRecentPosts',
    args: [0n, 50n], // Changed from 100 to 50 to match Feed component
    enabled: true,
  });

  // Log posts when they load
  useEffect(() => {
    console.log('📡 Contract address:', contractData.address);
    console.log('📡 Posts loading:', postsLoading);
    console.log('📡 Posts error:', postsError);
    if (allPosts) {
      console.log('📚 Posts loaded for search:', allPosts.length);
      console.log('📚 Posts data:', allPosts);
    } else {
    }
  }, [allPosts, postsLoading, postsError]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (onSearch) onSearch('', []);
      return;
    }
    
    // Trigger search animation
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 600);
    
    console.log('🔍 ========== SEARCH STARTED ==========');
    console.log('🔍 Search query:', searchQuery);
    console.log('🔍 Connected address:', address);
    console.log('📊 Total posts available:', allPosts?.length || 0);
    
    // If no posts loaded, try to refetch
    if (!allPosts || allPosts.length === 0) {
      console.log('🔄 No posts loaded, fetching...');
      await refetchPosts();
      console.log('📊 Posts after refetch:', allPosts?.length || 0);
    }
    
    const query = searchQuery.toLowerCase();
    
    try {
      // Search through posts
      const foundPosts = [];
      if (allPosts && Array.isArray(allPosts)) {
        console.log('🔄 Searching through', allPosts.length, 'posts...');
        
        for (let i = 0; i < allPosts.length; i++) {
          const post = allPosts[i];
          console.log(`Post ${i}:`, { id: post.id?.toString(), isActive: post.isActive, ipfsHash: post.ipfsHash });
          
          if (!post.isActive) {
            console.log(`⏭️ Skipping inactive post ${i}`);
            continue;
          }
          
          try {
            console.log(`📥 Loading content for post ${i}...`);
            const contentData = await getFromIPFS(post.ipfsHash);
            console.log(`📦 Raw content:`, contentData);
            
            let textContent = '';
            
            // Parse the content properly
            if (typeof contentData === 'string') {
              try {
                const parsed = JSON.parse(contentData);
                textContent = parsed.content || contentData;
              } catch {
                textContent = contentData;
              }
            } else if (typeof contentData === 'object') {
              textContent = contentData.content || JSON.stringify(contentData);
            }
            
            console.log(`📝 Extracted text: "${textContent}"`);
            console.log(`🔎 Query: "${query}" | Match: ${textContent.toLowerCase().includes(query)}`);
            
            if (textContent && textContent.toLowerCase().includes(query)) {
              console.log('✅ MATCH FOUND!');
              
              foundPosts.push({
                id: post.id,
                author: post.author,
                content: textContent, // Show full content
                fullContent: textContent, // Keep full content for display
                timestamp: post.timestamp,
                searchQuery: query // Store query for highlighting
              });
            }
          } catch (error) {
            console.error(`❌ Error loading post ${i}:`, error);
          }
        }
      } else {
        console.log('⚠️ No posts available to search');
      }
      
      console.log('🎯 Search complete:', foundPosts.length, 'posts found');
      console.log('📋 Found posts:', foundPosts);

      // Search through users by fetching ALL registered users from blockchain
      const foundUsers = [];
      
      console.log('👥 Fetching ALL registered users from blockchain...');
      
      // Get ALL registered users from blockchain
      let allUserAddresses = [];
      try {
        const registeredUsers = await readContract(config, {
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'getAllRegisteredUsers',
          args: [],
        });
        
        console.log('✅ Loaded', registeredUsers.length, 'registered users from blockchain');
        allUserAddresses = registeredUsers.map(addr => addr.toLowerCase());
      } catch (error) {
        console.error('❌ Error fetching registered users:', error);
        
        // Fallback: Get unique authors from posts
        const uniqueAuthors = [...new Set(allPosts?.map(post => post.author) || [])];
        console.log('📋 Fallback: Using', uniqueAuthors.length, 'unique authors from posts');
        allUserAddresses = uniqueAuthors.map(addr => addr.toLowerCase());
      }
      
      console.log('👥 Total users to search:', allUserAddresses.length);
      
      const userAddressArray = Array.from(allUserAddresses);
      console.log('👥 Searching through', userAddressArray.length, 'users from blockchain...');
      
      for (const authorAddress of userAddressArray) {
        try {
          console.log(`🔍 Checking user: ${authorAddress}`);
          
          // Fetch user profile from contract
          const userProfileData = await readContract(config, {
            address: contractData.address,
            abi: contractData.abi,
            functionName: 'getUserProfile',
            args: [authorAddress],
          });
          
          console.log(`📋 Profile data for ${authorAddress}:`, userProfileData);
          
          if (userProfileData && userProfileData.displayName && userProfileData.displayName.length > 0) {
            const displayName = userProfileData.displayName.toLowerCase();
            const userAddress = authorAddress.toLowerCase();
            
            console.log(`🔎 Comparing: "${displayName}" with query "${query}"`);
            
            // Check if query matches username or address
            if (displayName.includes(query) || userAddress.includes(query)) {
              console.log('✅ User match found:', displayName);
              
              // Get profile image if available
              let profileImage = '';
              if (userProfileData.profileIpfsHash && userProfileData.profileIpfsHash.length > 0) {
                try {
                  const profileData = await getFromIPFS(userProfileData.profileIpfsHash);
                  if (profileData && profileData.image) {
                    profileImage = profileData.image;
                  }
                } catch (error) {
                  console.error('Error loading profile image:', error);
                }
              }
              
              foundUsers.push({
                address: authorAddress,
                username: userProfileData.displayName,
                bio: userProfileData.bio || '',
                profileImage: profileImage,
                postCount: Number(userProfileData.postCount || 0),
                followerCount: Number(userProfileData.followerCount || 0),
                searchQuery: query
              });
              
              console.log('✅ Added user to results:', foundUsers[foundUsers.length - 1]);
            } else {
              console.log('❌ No match for:', displayName);
            }
          } else {
            console.log('⚠️ No profile or empty displayName for:', authorAddress);
          }
        } catch (error) {
          console.error('❌ Error fetching user profile for', authorAddress, ':', error);
        }
      }
      
      console.log('👥 Found', foundUsers.length, 'matching users');
      
      setSearchResults({ posts: foundPosts, users: foundUsers });
      
      // Pass search query AND user results to parent component
      if (onSearch) {
        onSearch(searchQuery, foundUsers);
      }
      
      setShowSearchResults(false); // Don't show dropdown, show in main feed instead
    } catch (error) {
      console.error('❌ Search error:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    
    // Apply theme to body
    if (newTheme) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.body.classList.add('light-theme');
    }
  }, []);

  return (
    <>
      <header className="header finisher-header">
        <div className="header-container">
          {/* Left - Logo */}
          <div className="header-left">
            <SunLogo />
          </div>

          {/* Center - Search Bar */}
          <form className="header-search-center" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search users, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`search-input ${isSearching ? 'searching' : ''}`}
            />
          </form>

          {/* Right - Buttons */}
          <div className="header-right">
            {isConnected ? (
              <>
                <button 
                  className="btn-stack-icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notification-badge-small">{unreadCount}</span>
                  )}
                </button>
                
                <button 
                  className="btn-stack-icon btn-profile-stack"
                  onClick={onProfileClick}
                  title={username ? `@${username}` : 'Profile'}
                >
                  {profileImage ? (
                    <img src={profileImage} alt={username || 'User'} className="profile-img-small" />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <button 
                  onClick={async () => {
                    try {
                      await disconnect();
                      // Clear all wagmi storage
                      Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('wagmi.')) {
                          localStorage.removeItem(key);
                        }
                      });
                    } catch (error) {
                      console.error('Disconnect error:', error);
                    }
                  }} 
                  className="btn-disconnect-header-with-text"
                  disabled={isConnecting || isReconnecting}
                  title="Disconnect Wallet"
                >
                  <LogOut size={18} />
                  <span>Disconnect</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showNotifications && <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />}
    </>
  );
}

export default Header;
