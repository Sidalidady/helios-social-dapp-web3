import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
import { User, Upload, Loader2, Save, X, Wallet } from 'lucide-react';
import { uploadToIPFS } from '../utils/ipfs';
import { formatAddress } from '../utils/formatters';
import contractData from '../contracts/SocialFeed.json';
import './Profile.css';

function Profile({ onClose }) {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Watch for new followers
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'UserFollowed',
    onLogs: (logs) => {
      logs.forEach((log) => {
        // If someone followed the current user, increment follower count
        if (log.args.followed?.toLowerCase() === address?.toLowerCase()) {
          setFollowerCount(prev => prev + 1);
        }
      });
    }
  });

  // Read existing profile
  const { data: existingProfile, isLoading: isLoadingProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (existingProfile) {
        const profileUsername = existingProfile.displayName || '';
        const ipfsHash = existingProfile.profileIpfsHash || '';
        
        setUsername(profileUsername);
        // Initialize follower count from profile
        setFollowerCount(Number(existingProfile.followerCount || 0));
        
        // If there's an IPFS hash, fetch the full profile data
        if (ipfsHash) {
          try {
            const { getFromIPFS } = await import('../utils/ipfs');
            const profileData = await getFromIPFS(ipfsHash);
            
            if (profileData) {
              // Extract bio and image from IPFS data
              if (typeof profileData === 'string') {
                try {
                  const parsed = JSON.parse(profileData);
                  setBio(parsed.bio || '');
                  if (parsed.image) {
                    setImagePreview(parsed.image);
                  }
                } catch {
                  // If it's just a string, use it as bio
                  setBio(profileData);
                }
              } else if (profileData.content) {
                // Handle wrapped content
                try {
                  const content = typeof profileData.content === 'string' 
                    ? JSON.parse(profileData.content) 
                    : profileData.content;
                  setBio(content.bio || '');
                  if (content.image) {
                    setImagePreview(content.image);
                  }
                } catch {
                  setBio(profileData.content);
                }
              } else {
                // Direct profile data object
                setBio(profileData.bio || '');
                if (profileData.image) {
                  setImagePreview(profileData.image);
                }
              }
            }
          } catch (error) {
            console.error('Error loading profile from IPFS:', error);
          }
        }
      }
    };
    
    loadProfile();
  }, [existingProfile]);

  useEffect(() => {
    if (isSuccess) {
      alert('Profile updated successfully!');
      if (onClose) onClose();
    }
  }, [isSuccess, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
      setIsUploading(true);

      // Create profile data object
      const profileData = {
        username: username.trim(),
        bio: bio.trim(),
        address: address,
        timestamp: Date.now(),
      };

      // If there's an image preview, add it to the profile data
      if (imagePreview) {
        console.log('Saving profile with image, length:', imagePreview.length);
        profileData.image = imagePreview;
      }

      // Upload profile data to IPFS
      const ipfsHash = await uploadToIPFS(JSON.stringify(profileData));
      console.log('Profile uploaded to IPFS:', ipfsHash);
      
      setIsUploading(false);

      // Update profile on blockchain
      writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'updateProfile',
        args: [username.trim(), ipfsHash],
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
      setIsUploading(false);
    }
  };

  const isProcessing = isUploading || isPending || isConfirming;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isLoadingProfile && (
          <div className="profile-loading">
            <Loader2 size={24} className="spinning" />
            <p>Loading your profile...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-section">
            <div className="profile-image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" />
              ) : (
                <div className="profile-image-placeholder">
                  <User size={48} />
                </div>
              )}
            </div>
            <label className="upload-button">
              <Upload size={16} />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isProcessing}
                style={{ display: 'none' }}
              />
            </label>
            <p className="image-hint">Max 5MB (JPG, PNG, GIF)</p>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={30}
              disabled={isProcessing}
              required
            />
            <span className="char-count">{username.length}/30</span>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={160}
              rows={2}
              disabled={isProcessing}
            />
            <span className="char-count">{bio.length}/160</span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  {isUploading ? 'Uploading...' : isPending ? 'Confirming...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
