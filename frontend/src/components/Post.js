import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Heart, User, Loader2, Trash2 } from 'lucide-react';
import { getFromIPFS } from '../utils/ipfs';
import { formatAddress, formatTimestamp } from '../utils/formatters';
import { addNotification } from './Notifications';
import { contractData } from '../utils/contract';
import Comments from './Comments';
import UserProfileModal from './UserProfileModal';
import './Post.css';

function Post({ post, onDelete }) {
  const [content, setContent] = useState('Loading...');
  const [postImage, setPostImage] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authorUsername, setAuthorUsername] = useState('');
  const [authorImage, setAuthorImage] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { address } = useAccount();

  // Get author's profile
  const { data: authorProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [post.author],
  });

  // Check if user has liked this post
  const { data: hasLiked, refetch: refetchLikeStatus } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'hasLiked',
    args: [post.id, address || '0x0000000000000000000000000000000000000000'],
  });
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getFromIPFS(post.ipfsHash);
        
        // Handle different data formats
        if (typeof data === 'object' && data !== null) {
          // Data is already an object
          setContent(data.content || JSON.stringify(data));
          if (data.image) {
            setPostImage(data.image);
          }
        } else if (typeof data === 'string') {
          // Try to parse as JSON
          if (data.startsWith('{')) {
            try {
              const postData = JSON.parse(data);
              setContent(postData.content || data);
              if (postData.image) {
                setPostImage(postData.image);
              }
            } catch {
              // Not valid JSON, just plain text
              setContent(data);
            }
          } else {
            // Plain text
            setContent(data);
          }
        } else {
          setContent('Failed to load content');
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setContent('Error loading post');
      }
    };
    
    loadContent();
  }, [post.ipfsHash]);

  useEffect(() => {
    const loadAuthorProfile = async () => {
      if (authorProfile && authorProfile.displayName && authorProfile.displayName.length > 0) {
        setAuthorUsername(authorProfile.displayName);
        
        const ipfsHash = authorProfile.profileIpfsHash;
        
        if (ipfsHash && ipfsHash.length > 0) {
          try {
            const profileData = await getFromIPFS(ipfsHash);
            if (profileData && profileData.image) {
              setAuthorImage(profileData.image);
            }
          } catch (error) {
            console.error('Error loading author profile image:', error);
          }
        }
      } else {
        setAuthorUsername('Anonymous User');
      }
    };
    
    loadAuthorProfile();
  }, [authorProfile]);

  const handleLike = async () => {
    if (!address || isLiking || isConfirming) return;

    setIsLiking(true);
    
    const functionName = hasLiked ? 'unlikePost' : 'likePost';
    const isLikingPost = !hasLiked;
    
    writeContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName,
      args: [post.id],
    }, {
      onSuccess: () => {
        refetchLikeStatus();
        setIsLiking(false);
        
        // Add notification for post author (if liking and not own post)
        if (isLikingPost && post.author && post.author.toLowerCase() !== address.toLowerCase()) {
          addNotification(post.author, {
            type: 'like',
            from: address,
            message: 'liked your post',
            content: content.substring(0, 100),
            postId: post.id.toString(),
          });
        }
      },
      onError: (error) => {
        console.error('❌ Like/Unlike failed:', error);
        let errorMessage = 'Transaction failed';
        if (error.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas fees';
        } else if (error.message?.includes('user rejected')) {
          errorMessage = 'Transaction rejected';
        }
        alert(errorMessage);
        setIsLiking(false);
      }
    });
  };

  const { writeContract: deleteWriteContract, data: deleteHash } = useWriteContract();
  const { isLoading: isDeleteConfirming } = useWaitForTransactionReceipt({ hash: deleteHash });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This will require a blockchain transaction.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Call smart contract to delete post
      deleteWriteContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'deletePost',
        args: [post.id],
      }, {
        onSuccess: () => {
          console.log('Post deletion transaction sent:', post.id);
          // Store locally as well for immediate UI update
          const deletedPosts = JSON.parse(localStorage.getItem('deleted_posts') || '[]');
          deletedPosts.push(post.id.toString());
          localStorage.setItem('deleted_posts', JSON.stringify(deletedPosts));
          
          // Notify parent component to refresh
          if (onDelete) {
            onDelete(post.id);
          }
          setIsDeleting(false);
        },
        onError: (error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post: ' + error.message);
          setIsDeleting(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete post');
      setIsDeleting(false);
    }
  };

  // Function to render post text with @mentions highlighted
  const renderContentWithMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add mention as styled span
      parts.push(
        <span key={match.index} style={{
          color: '#f97316',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          @{match[1]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const isOwnPost = address && post.author.toLowerCase() === address.toLowerCase();
  const likeCount = Number(post.likes);

  return (
    <>
      {showUserProfile && (
        <UserProfileModal 
          userAddress={post.author} 
          onClose={() => setShowUserProfile(false)} 
        />
      )}
      
      <div className="post" data-post-id={post.id.toString()} id={`post-${post.id.toString()}`}>
        <div className="post-header">
          <div className="post-author">
            <div 
              className="author-avatar clickable" 
              onClick={() => !isOwnPost && setShowUserProfile(true)}
              style={{ cursor: isOwnPost ? 'default' : 'pointer' }}
            >
              {authorImage ? (
                <img src={authorImage} alt={authorUsername} />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <div 
                className="author-name clickable" 
                onClick={() => !isOwnPost && setShowUserProfile(true)}
                style={{ cursor: isOwnPost ? 'default' : 'pointer' }}
              >
                {authorUsername}
                {isOwnPost && <span className="own-badge">You</span>}
              </div>
              <div className="post-timestamp">
                {formatTimestamp(post.timestamp)}
              </div>
            </div>
          </div>
        {isOwnPost && (
          <button 
            className="btn-delete-post"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete post"
          >
            {isDeleting ? (
              <Loader2 size={16} className="spinning" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        )}
      </div>

      <div className="post-content">
        {renderContentWithMentions(content)}
      </div>

      {postImage && (
        <div className="post-image-container">
          <img src={postImage} alt="Post" className="post-image" />
        </div>
      )}

      <div className="post-footer">
        <button 
          className={`btn-like ${hasLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''}`}
          onClick={handleLike}
          disabled={!address || isLiking || isConfirming}
        >
          {isLiking || isConfirming ? (
            <Loader2 size={16} className="spinning" />
          ) : (
            <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
          )}
          <span>{likeCount}</span>
        </button>
      </div>

      <Comments postId={post.id} postAuthor={post.author} />
    </div>
    </>
  );
}

export default Post;
