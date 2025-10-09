import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { User, Upload, Loader2, Save, X, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadToIPFS } from '../utils/ipfs';
import contractData from '../contracts/SocialFeed.json';
import './ProfileNew.css';

function ProfileNew({ onClose }) {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const { writeContract: deleteProfileContract, data: deleteHash, isPending: isDeletePending } = useWriteContract();
  const { isLoading: isDeleteConfirming, isSuccess: isDeleteSuccess } = useWaitForTransactionReceipt({ hash: deleteHash });

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
        
        if (ipfsHash) {
          try {
            const { getFromIPFS } = await import('../utils/ipfs');
            const profileData = await getFromIPFS(ipfsHash);
            
            if (profileData) {
              if (typeof profileData === 'string') {
                try {
                  const parsed = JSON.parse(profileData);
                  setBio(parsed.bio || '');
                  if (parsed.image) setImagePreview(parsed.image);
                } catch {
                  setBio(profileData);
                }
              } else if (profileData.content) {
                try {
                  const content = typeof profileData.content === 'string' 
                    ? JSON.parse(profileData.content) 
                    : profileData.content;
                  setBio(content.bio || '');
                  if (content.image) setImagePreview(content.image);
                } catch {
                  setBio(profileData.content);
                }
              } else {
                setBio(profileData.bio || '');
                if (profileData.image) setImagePreview(profileData.image);
              }
            }
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }
      }
    };
    
    loadProfile();
  }, [existingProfile]);

  useEffect(() => {
    if (isSuccess) {
      alert('Profile updated successfully!');
      onClose();
    }
  }, [isSuccess, onClose]);
  
  useEffect(() => {
    if (isDeleteSuccess) {
      alert('Profile deleted successfully!');
      onClose();
      window.location.reload();
    }
  }, [isDeleteSuccess, onClose]);
  
  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim() || username.trim().length < 3) {
        setUsernameAvailable(null);
        return;
      }
      
      // If username hasn't changed from existing profile, skip check
      if (existingProfile && username.trim().toLowerCase() === existingProfile.displayName.toLowerCase()) {
        setUsernameAvailable(true);
        return;
      }
      
      setCheckingUsername(true);
      
      try {
        const { readContract } = await import('wagmi/actions');
        const { config } = await import('../config/wagmi');
        
        const available = await readContract(config, {
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'isUsernameAvailable',
          args: [username.trim()],
        });
        
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };
    
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, existingProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfile = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      deleteProfileContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'deleteProfile',
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile: ' + error.message);
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
    
    if (username.trim().length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }
    
    if (usernameAvailable === false) {
      alert('Username is already taken. Please choose another one.');
      return;
    }

    try {
      setIsUploading(true);

      const profileData = {
        username: username.trim(),
        bio: bio.trim(),
        address: address,
        timestamp: Date.now(),
      };

      if (imagePreview) {
        profileData.image = imagePreview;
      }

      const ipfsHash = await uploadToIPFS(JSON.stringify(profileData));
      setIsUploading(false);

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
    <div className="profile-new-overlay" onClick={onClose}>
      <div className="profile-new-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-new-header">
          <h2>Edit Profile</h2>
          <button className="profile-new-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isLoadingProfile ? (
          <div className="profile-new-loading">
            <Loader2 size={20} className="spinning" />
            <p>Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-new-form">
            <div className="profile-new-avatar-section">
              <div className="profile-new-avatar">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" />
                ) : (
                  <User size={32} />
                )}
              </div>
              <label className="profile-new-upload-btn">
                <Upload size={14} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isProcessing}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="profile-new-field">
              <label>Username</label>
              <div className="profile-new-input-wrapper">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  maxLength={30}
                  disabled={isProcessing}
                  required
                  className={usernameAvailable === false ? 'input-error' : usernameAvailable === true ? 'input-success' : ''}
                />
                {checkingUsername && (
                  <span className="profile-new-status checking">
                    <Loader2 size={14} className="spinning" />
                  </span>
                )}
                {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
                  <span className="profile-new-status available">
                    <CheckCircle size={14} />
                  </span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="profile-new-status taken">
                    <AlertCircle size={14} />
                  </span>
                )}
              </div>
              <div className="profile-new-feedback">
                <span className="profile-new-count">{username.length}/30</span>
                {!checkingUsername && usernameAvailable === false && (
                  <span className="profile-new-error">Already taken</span>
                )}
                {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
                  <span className="profile-new-success">Available</span>
                )}
              </div>
            </div>

            <div className="profile-new-field">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={160}
                rows={2}
                disabled={isProcessing}
              />
              <span className="profile-new-count">{bio.length}/160</span>
            </div>

            <div className="profile-new-actions">
              <button
                type="button"
                onClick={onClose}
                className="profile-new-btn profile-new-btn-cancel"
                disabled={isProcessing || isDeletePending || isDeleteConfirming}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-new-btn profile-new-btn-save"
                disabled={isProcessing || isDeletePending || isDeleteConfirming}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="spinning" />
                    {isUploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save
                  </>
                )}
              </button>
            </div>

            {existingProfile && existingProfile.exists && (
              <div className="profile-new-delete-section">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    className="profile-new-btn profile-new-btn-delete"
                    disabled={isProcessing || isDeletePending || isDeleteConfirming}
                  >
                    <Trash2 size={13} />
                    Delete Profile
                  </button>
                ) : (
                  <div className="profile-new-confirm">
                    <p>Delete profile? This cannot be undone!</p>
                    <div className="profile-new-confirm-actions">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="profile-new-btn profile-new-btn-cancel-small"
                        disabled={isDeletePending || isDeleteConfirming}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteProfile}
                        className="profile-new-btn profile-new-btn-delete-confirm"
                        disabled={isDeletePending || isDeleteConfirming}
                      >
                        {isDeletePending || isDeleteConfirming ? (
                          <>
                            <Loader2 size={13} className="spinning" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={13} />
                            Confirm
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfileNew;
