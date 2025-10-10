import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { User, Upload, Loader2, X, CheckCircle, XCircle, Camera, AlertCircle } from 'lucide-react';
import { uploadToIPFS } from '../utils/ipfs';
import { contractData } from '../utils/contract';
import './Registration.css';

function Registration({ onComplete, onSkip, isFirstTime = false }) {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const { address, isConnected } = useAccount();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  // Check username availability from smart contract
  const { data: isAvailable, error: usernameError, refetch: recheckUsername } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'isUsernameAvailable',
    args: [username],
    enabled: username.length >= 3,
  });

  useEffect(() => {
    if (username.length >= 3 && isAvailable !== undefined) {
      setUsernameAvailable(isAvailable);
      setIsCheckingUsername(false);
    } else if (username.length >= 3 && usernameError) {
      // If function doesn't exist (old contract), assume available
      console.warn('Username check unavailable (old contract version)');
      setUsernameAvailable(true);
      setIsCheckingUsername(false);
    } else if (username.length < 3) {
      setUsernameAvailable(null);
    }
  }, [isAvailable, usernameError, username]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(value);
    if (value.length >= 3) {
      setIsCheckingUsername(true);
      setTimeout(() => recheckUsername(), 500);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Check file type - accept PNG, JPEG, JPG, GIF, WebP
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert('Please select a valid image file (PNG, JPEG, JPG, GIF, or WebP)');
        return;
      }
      
      console.log('Image selected:', file.name, 'Type:', file.type, 'Size:', (file.size / 1024).toFixed(2) + 'KB');
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image converted to base64, length:', reader.result.length);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || username.length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }

    if (usernameAvailable === false) {
      alert('This username is already taken. Please choose another one.');
      return;
    }

    try {
      setIsUploading(true);

      // Create profile data
      const profileData = {
        username: username.trim(),
        bio: '',
        address: address,
        timestamp: Date.now(),
        registeredAt: new Date().toISOString(),
      };

      // If there's an image preview, add it to profile data
      if (imagePreview) {
        console.log('Saving profile with image, length:', imagePreview.length);
        profileData.image = imagePreview;
        
        // Upload profile data with image to IPFS
        const ipfsHash = await uploadToIPFS(JSON.stringify(profileData));
        console.log('Profile uploaded to IPFS:', ipfsHash);
        
        setIsUploading(false);

        // Register on blockchain
        writeContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'updateProfile',
          args: [username.trim(), ipfsHash],
        });
      } else {
        // Upload profile data without image to IPFS
        console.log('Saving profile without image');
        const ipfsHash = await uploadToIPFS(JSON.stringify(profileData));
        console.log('Profile uploaded to IPFS:', ipfsHash);
        
        setIsUploading(false);

        // Register on blockchain
        writeContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'updateProfile',
          args: [username.trim(), ipfsHash],
        });
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register: ' + error.message);
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      // Save user address to localStorage for search functionality
      const registeredUsers = JSON.parse(localStorage.getItem('all_registered_users') || '[]');
      if (!registeredUsers.includes(address)) {
        registeredUsers.push(address);
        localStorage.setItem('all_registered_users', JSON.stringify(registeredUsers));
        console.log('✅ User address saved to registered users list');
      }
      
      // Call onComplete immediately after success
      console.log('✅ Registration success! Calling onComplete...');
      setTimeout(() => {
        onComplete();
      }, 500); // Reduced from 1500ms to 500ms
    }
  }, [isSuccess, onComplete, address]);

  const isProcessing = isUploading || isPending || isConfirming;

  if (isSuccess) {
    return (
      <div className="registration-modal-overlay">
        <div className="registration-modal">
          <div className="registration-success">
            <CheckCircle size={64} className="success-icon" />
            <h2>Welcome to Helios Social!</h2>
            <p>Your account has been created successfully.</p>
            <p className="success-username">@{username}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-modal-overlay">
      <div className="registration-modal">
        <div className="registration-header">
          <div className="registration-icon">
            <User size={32} />
          </div>
          <h2>{isFirstTime ? 'Create Your Profile' : 'Welcome to Helios Social'}</h2>
          <p className="registration-subtitle">
            {isFirstTime 
              ? '✨ Complete your profile to start using the DApp' 
              : 'Create your account to get started'}
          </p>
          {isFirstTime && (
            <div className="first-time-notice">
              <AlertCircle size={16} />
              <span>Profile creation is required to use the platform</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Profile Picture Upload */}
          <div className="profile-picture-section">
            <div className="profile-picture-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" />
              ) : (
                <div className="profile-picture-placeholder">
                  <User size={48} />
                </div>
              )}
              <div className="picture-overlay">
                <Camera size={24} />
              </div>
            </div>
            <div className="picture-upload-info">
              <label htmlFor="profilePicture" className="upload-picture-button">
                <Upload size={16} />
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                  onChange={handleImageChange}
                  disabled={isProcessing}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="picture-hint">Optional • Max 5MB • PNG, JPEG, JPG, GIF, WebP</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">
              Username <span className="required">*</span>
            </label>
            <div className="username-input-wrapper">
              <span className="username-prefix">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="username"
                maxLength={30}
                disabled={isProcessing}
                required
                className={usernameAvailable === false ? 'invalid' : usernameAvailable === true ? 'valid' : ''}
              />
              {isCheckingUsername && <Loader2 size={16} className="spinning username-status" />}
              {!isCheckingUsername && usernameAvailable === true && (
                <CheckCircle size={16} className="username-status valid" />
              )}
              {!isCheckingUsername && usernameAvailable === false && (
                <XCircle size={16} className="username-status invalid" />
              )}
            </div>
            <div className="username-hints">
              <span className="char-count">{username.length}/30</span>
              {usernameAvailable === true && (
                <span className="hint success">✓ Username available</span>
              )}
              {usernameAvailable === false && (
                <span className="hint error">✗ Username already taken</span>
              )}
              {username.length > 0 && username.length < 3 && (
                <span className="hint">Minimum 3 characters</span>
              )}
            </div>
          </div>

          <div className="info-box">
            <AlertCircle size={16} />
            <div>
              <strong>Important:</strong> Your username will be linked to your wallet address and displayed on all your posts.
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-register"
              disabled={isProcessing || usernameAvailable !== true || username.length < 3}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  {isUploading ? 'Uploading...' : isPending ? 'Confirming...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Create Account
                </>
              )}
            </button>
            {onSkip && !isFirstTime && (
              <button
                type="button"
                onClick={onSkip}
                className="btn-login"
                disabled={isProcessing}
              >
                Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
