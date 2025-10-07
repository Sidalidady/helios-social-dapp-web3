import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { HelpCircle, Send, Loader2, Image, X } from 'lucide-react';
import { uploadToIPFS } from '../utils/ipfs';
import contractData from '../contracts/SocialFeed.json';
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
  
  useEffect(() => {
    if (isConfirmed && hash && !hasRefreshed) {
      console.log('✅ Post confirmed on blockchain!');
      console.log('🔄 Refreshing feed in 2 seconds...');
      setHasRefreshed(true);
      
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
    }
  }, [isConfirmed, hash, hasRefreshed, onPostCreated]);

  const MAX_LENGTH = 280;
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
      const ipfsHash = await uploadToIPFS(JSON.stringify(postData));

      // Create post on-chain
      writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'createPost',
        args: [ipfsHash],
      }, {
        onSuccess: (data) => {
          console.log('✅ Post transaction sent! Hash:', data);
          setContent('');
          setPostImage(null);
          setImagePreview('');
          setIsUploading(false);
        },
        onError: (error) => {
          console.error('❌ Transaction failed:', error);
          console.error('Error details:', {
            message: error.message,
            cause: error.cause,
            shortMessage: error.shortMessage
          });
          
          let errorMessage = 'Failed to create post';
          if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees';
          } else if (error.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (error.shortMessage) {
            errorMessage = error.shortMessage;
          }
          
          alert(errorMessage);
          setIsUploading(false);
        }
      });
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      setIsUploading(false);
      alert('Failed to upload content. Please try again.');
    }
  };

  const isLoading = isUploading || isPending || isConfirming;

  return (
    <div className="create-post">
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
              <br />Max 280 characters.
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
