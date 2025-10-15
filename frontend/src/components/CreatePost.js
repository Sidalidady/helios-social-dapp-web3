import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { HelpCircle, Send, Loader2, Image, X } from 'lucide-react';
import { uploadToIPFS } from '../utils/ipfs';
import { contractData } from '../utils/contract';
import { addNotification } from './Notifications';
import './CreatePost.css';

function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { isConnected } = useAccount();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1,
  });

  // Trigger refresh when transaction is confirmed
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (isConfirmed && hash && !hasRefreshed) {
      console.log('✅ Post confirmed on blockchain!');
      console.log('Transaction hash:', hash);
      setHasRefreshed(true);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Wait for blockchain to propagate
      setTimeout(() => {
        console.log('📡 Triggering feed refresh...');
        if (onPostCreated) {
          onPostCreated();
        }
        // Force a second refresh after 2 more seconds
        setTimeout(() => {
          console.log('🔄 Second refresh...');
          if (onPostCreated) {
            onPostCreated();
          }
        }, 2000);
      }, 2000);
    }
    
    // Reset when hash changes (new transaction)
    if (!hash) {
      setHasRefreshed(false);
      setShowSuccess(false);
    }
  }, [isConfirmed, hash, hasRefreshed, onPostCreated]);

  const MAX_LENGTH = 300;
  const charCount = content.length;
  const isOverLimit = charCount > MAX_LENGTH;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPostImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || isOverLimit || !isConnected) return;

    try {
      setIsUploading(true);
      
      // Create post data object
      const postData = {
        content: content.trim(),
        timestamp: Date.now(),
      };

      // Add image if present
      if (imagePreview) {
        postData.image = imagePreview;
      }
      
      // Upload post data to IPFS
      console.log('📤 Uploading post to IPFS...');
      const ipfsHash = await uploadToIPFS(JSON.stringify(postData));
      console.log('✅ IPFS upload complete:', ipfsHash);

      // Validate contract address
      if (!contractData.address || contractData.address === '0x0000000000000000000000000000000000000000') {
        throw new Error('Invalid contract address');
      }

      console.log('📝 Creating post on blockchain...');
      console.log('Contract address:', contractData.address);
      console.log('IPFS hash:', ipfsHash);

      // Create post on-chain
      writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'createPost',
        args: [ipfsHash],
      });

      // Check for @mentions and notify mentioned users
      const mentionRegex = /@(\w+)/g;
      let match;
      const mentionedUsers = new Set();
      
      while ((match = mentionRegex.exec(content)) !== null) {
        const mentionedUsername = match[1].toLowerCase();
        mentionedUsers.add(mentionedUsername);
      }
      
      // Find mentioned users' addresses and notify them
      if (mentionedUsers.size > 0) {
        console.log('📢 Found @mentions:', Array.from(mentionedUsers));
        const allUsers = JSON.parse(localStorage.getItem('all_registered_users') || '[]');
        
        for (const userAddr of allUsers) {
          try {
            const { readContract } = await import('wagmi/actions');
            const { config } = await import('../config/wagmi');
            
            const userProfile = await readContract(config, {
              address: contractData.address,
              abi: contractData.abi,
              functionName: 'getUserProfile',
              args: [userAddr],
            });
            
            if (userProfile && userProfile.displayName) {
              const username = userProfile.displayName.toLowerCase();
              
              if (mentionedUsers.has(username) && userAddr.toLowerCase() !== address.toLowerCase()) {
                console.log(`✅ Notifying @${username} about mention in post`);
                addNotification(userAddr, {
                  type: 'tag',
                  from: address,
                  message: 'tagged you in a post',
                  content: content.trim().substring(0, 100),
                  postId: 'latest', // Will be updated when post is confirmed
                });
              }
            }
          } catch (error) {
            console.error('Error notifying mentioned user:', error);
          }
        }
      }

      // Clear form immediately after sending transaction
      setContent('');
      setPostImage(null);
      setImagePreview('');
      setIsUploading(false);
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('Error details:', {
        message: error.message,
        cause: error.cause,
        shortMessage: error.shortMessage
      });
      
      let errorMessage = 'Failed to create post';
      if (error.message && error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.message && error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.shortMessage) {
        errorMessage = error.shortMessage;
      }
      
      alert(errorMessage);
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || isPending || isConfirming;

  return (
    <div className="create-post">
      {showSuccess && (
        <div className="success-banner">
          ✅ Post created successfully! Refreshing feed...
        </div>
      )}
      
      <div className="create-post-header">
        <h3>Share your thoughts</h3>
        <div className="hint-container">
          <HelpCircle 
            size={18} 
            className="hint-icon"
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
          />
          {showHint && (
            <div className="hint-tooltip">
              Your post will be stored on IPFS and the blockchain!
              <br />Max {MAX_LENGTH} characters.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isConnected ? "What's happening in Web3?" : "Connect wallet to post..."}
          disabled={!isConnected || isLoading}
          className={isOverLimit ? 'over-limit' : ''}
        />
        
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button 
              type="button"
              onClick={removeImage}
              className="btn-remove-image"
              title="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        )}
        
        <div className="create-post-footer">
          <div className="post-actions">
            <label className="btn-add-image" title="Add image">
              <Image size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!isConnected || isLoading}
                style={{ display: 'none' }}
              />
            </label>
            <div className="char-counter">
              <span className={isOverLimit ? 'over-limit' : ''}>
                {charCount}/{MAX_LENGTH}
              </span>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!isConnected || !content.trim() || isOverLimit || isLoading}
            className={`btn-post ${content.trim() ? 'active' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinning" />
                {isUploading ? 'Uploading...' : isConfirming ? 'Confirming...' : 'Posting...'}
              </>
            ) : (
              <>
                <Send size={16} />
                Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
