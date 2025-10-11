import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { X, User, Users, FileText, Calendar } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import FollowButton from './FollowButton';
import { contractData } from '../utils/contract';
import './UserProfileModal.css';

function UserProfileModal({ userAddress, onClose }) {
  const { address: currentUserAddress } = useAccount();
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
  const [userPosts, setUserPosts] = useState([]);

  // Get user's profile from blockchain
  const { data: userProfile, refetch: refetchProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [userAddress],
    enabled: !!userAddress,
  });

  // Get all posts to filter user's posts
  const { data: allPosts, refetch: refetchPosts } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getAllPosts',
  });

  // Watch for profile updates
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'ProfileUpdated',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.user?.toLowerCase() === userAddress?.toLowerCase()) {
          console.log('🔄 Profile updated, refreshing...');
          refetchProfile();
        }
      });
    }
  });

  // Watch for new posts
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostCreated',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.author?.toLowerCase() === userAddress?.toLowerCase()) {
          console.log('📝 New post created, refreshing...');
          refetchPosts();
        }
      });
    }
  });

  // Watch for follows
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'UserFollowed',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.followed?.toLowerCase() === userAddress?.toLowerCase() ||
            log.args.follower?.toLowerCase() === userAddress?.toLowerCase()) {
          console.log('👥 Follow event, refreshing profile...');
          refetchProfile();
        }
      });
    }
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (userProfile && userProfile.profileIpfsHash) {
        try {
          const profileData = await getFromIPFS(userProfile.profileIpfsHash);
          if (profileData) {
            if (profileData.image) setProfileImage(profileData.image);
            if (profileData.bio) setBio(profileData.bio);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };

    loadProfile();
  }, [userProfile]);

  // Filter user's posts
  useEffect(() => {
    if (allPosts && userAddress) {
      const filtered = allPosts.filter(post => 
        post && post.author && post.author.toLowerCase() === userAddress.toLowerCase()
      );
      setUserPosts(filtered);
    }
  }, [allPosts, userAddress]);

  if (!userAddress) return null;

  const username = userProfile?.displayName || 'Anonymous';
  const followerCount = userProfile?.followerCount ? Number(userProfile.followerCount) : 0;
  const followingCount = userProfile?.followingCount ? Number(userProfile.followingCount) : 0;
  const postCount = userPosts.length;
  const isCurrentUser = currentUserAddress && userAddress.toLowerCase() === currentUserAddress.toLowerCase();

  // Log blockchain stats
  console.log('📊 User Profile Stats from Blockchain:');
  console.log('  Username:', username);
  console.log('  Followers:', followerCount, '(from blockchain)');
  console.log('  Following:', followingCount, '(from blockchain)');
  console.log('  Posts:', postCount, '(counted from blockchain)');
  console.log('  Profile IPFS Hash:', userProfile?.profileIpfsHash);
  console.log('  Bio from IPFS:', bio);

  return (
    <div className="user-profile-modal-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="user-profile-modal-content">
          {/* Profile Header */}
          <div className="user-profile-header">
          <div className="user-profile-avatar">
            {profileImage ? (
              <img src={profileImage} alt={username} />
            ) : (
              <User size={60} />
            )}
          </div>
          <h2 className="user-profile-username">@{username}</h2>
          {bio && <p className="user-profile-bio">{bio}</p>}
        </div>

        {/* Stats */}
        <div className="user-profile-stats">
          <div className="stat-item">
            <FileText size={20} />
            <div className="stat-content">
              <span className="stat-value">{postCount}</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
          <div className="stat-item">
            <Users size={20} />
            <div className="stat-content">
              <span className="stat-value">{followerCount}</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>
          <div className="stat-item">
            <Users size={20} />
            <div className="stat-content">
              <span className="stat-value">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>

        {/* Follow Button */}
        {!isCurrentUser && (
          <div className="user-profile-actions">
            <FollowButton targetAddress={userAddress} />
          </div>
        )}

        {/* Recent Posts Preview */}
        <div className="user-profile-posts">
          <h3 className="posts-title">
            <FileText size={18} />
            Recent Posts
          </h3>
          {userPosts.length > 0 ? (
            <div className="posts-preview">
              {userPosts.slice(0, 3).map((post, index) => (
                <div key={index} className="post-preview-item">
                  <div className="post-preview-content">
                    <span className="post-preview-likes">❤️ {Number(post.likes || 0)}</span>
                    <span className="post-preview-comments">💬 {Number(post.commentCount || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-posts">No posts yet</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
