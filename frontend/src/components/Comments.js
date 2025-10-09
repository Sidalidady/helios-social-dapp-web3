import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MessageCircle, Send, User, Loader2, Trash2, Edit2, X, Check, Heart, CornerDownRight } from 'lucide-react';
import { uploadToIPFS, getFromIPFS } from '../utils/ipfs';
import { formatTimestamp } from '../utils/formatters';
import { addNotification } from './Notifications';
import { contractData } from '../utils/contract';
import './Comments.css';
function Comments({ postId, postAuthor }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Load comments from localStorage and set up auto-refresh
  useEffect(() => {
    const loadComments = () => {
      const postIdStr = postId.toString();
      const storedComments = localStorage.getItem(`comments_${postIdStr}`);
      if (storedComments) {
        try {
          setComments(JSON.parse(storedComments));
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    };
    
    // Load comments initially
    loadComments();
    
    // Set up auto-refresh every 3 seconds to check for new comments
    const intervalId = setInterval(() => {
      loadComments();
    }, 3000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [postId]);
  
  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      const postIdStr = postId.toString();
      if (e.key === `comments_${postIdStr}` && e.newValue) {
        try {
          setComments(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [postId]);

  // Function to render comment text with @mentions highlighted
  const renderCommentWithMentions = (text) => {
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
        <span key={match.index} className="mention">
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !isConnected) return;

    setIsSubmitting(true);
    try {
      // Upload comment to IPFS
      const commentData = {
        content: newComment.trim(),
        timestamp: Date.now(),
      };
      const ipfsHash = await uploadToIPFS(JSON.stringify(commentData));
      console.log('Comment uploaded to IPFS:', ipfsHash);

      // Send blockchain transaction
      await writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'addComment',
        args: [postId, ipfsHash],
      });

      console.log('Comment transaction sent');
      
      // Store locally for immediate display
      // Convert postId to string to avoid BigInt serialization issues
      const postIdStr = postId.toString();
      const comment = {
        id: Date.now(),
        postId: postIdStr,
        author: address,
        content: newComment.trim(),
        timestamp: Date.now(),
      };

      const storedComments = localStorage.getItem(`comments_${postIdStr}`);
      const existingComments = storedComments ? JSON.parse(storedComments) : [];
      const updatedComments = [...existingComments, comment];
      
      localStorage.setItem(`comments_${postIdStr}`, JSON.stringify(updatedComments));
      setComments(updatedComments);
      
      // Add notification for post author (if not commenting on own post)
      if (postAuthor && postAuthor.toLowerCase() !== address.toLowerCase()) {
        addNotification(postAuthor, {
          type: 'comment',
          from: address,
          message: 'commented on your post',
          content: newComment.trim().substring(0, 100),
          postId: postIdStr,
        });
      }
      
      // Check for mentions and add notifications
      const mentionRegex = /@(\w+)/g;
      let match;
      const mentionedUsers = new Set();
      
      while ((match = mentionRegex.exec(newComment)) !== null) {
        const mentionedUsername = match[1].toLowerCase();
        mentionedUsers.add(mentionedUsername);
      }
      
      // Find mentioned users' addresses and notify them
      if (mentionedUsers.size > 0) {
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
                addNotification(userAddr, {
                  type: 'mention',
                  from: address,
                  message: 'mentioned you in a comment',
                  content: newComment.trim().substring(0, 100),
                  postId: postIdStr,
                });
              }
            }
          } catch (error) {
            console.error('Error notifying mentioned user:', error);
          }
        }
      }
      
      setNewComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + (error.message || 'Transaction failed'));
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId, replyToUsername) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const replyData = {
        content: replyText.trim(),
        replyTo: commentId,
        timestamp: Date.now(),
      };
      const ipfsHash = await uploadToIPFS(JSON.stringify(replyData));

      writeContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'addCommentReply',
        args: [postId, commentId, ipfsHash],
      }, {
        onSuccess: () => {
          setReplyText('');
          setReplyingTo(null);
          setIsSubmitting(false);
        },
        onError: (error) => {
          console.error('Error adding reply:', error);
          alert('Failed to add reply');
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
    }
  };

  const CommentItem = ({ comment, replies = [] }) => {
    const [authorUsername, setAuthorUsername] = useState('');
    const [authorImage, setAuthorImage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const { writeContract: editWriteContract } = useWriteContract();
    const { writeContract: deleteWriteContract } = useWriteContract();
    const { writeContract: likeWriteContract } = useWriteContract();

    // Check if user has liked this comment
    const { data: likeStatus } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'hasLikedComment',
      args: [comment.id, address],
      enabled: !!comment.id && !!address,
    });

    useEffect(() => {
      if (likeStatus !== undefined) {
        setHasLiked(likeStatus);
      }
    }, [likeStatus]);

    // Get author's profile
    const { data: authorProfile } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getUserProfile',
      args: [comment.author],
    });

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
              console.error('Error loading author profile:', error);
            }
          }
        } else {
          setAuthorUsername('Anonymous User');
        }
      };
      
      loadAuthorProfile();
    }, [authorProfile]);

    const handleDelete = async () => {
      if (!window.confirm('Delete this comment? This requires a blockchain transaction.')) {
        return;
      }

      setIsDeleting(true);
      try {
        const postIdStr = postId.toString();
        const commentId = comment.id;
        
        console.log('Deleting comment:', { postId: postId.toString(), commentId });

        await deleteWriteContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'deleteComment',
          args: [postId, commentId],
        });

        console.log('Comment deleted successfully');

        // Remove from local storage
        const storedComments = localStorage.getItem(`comments_${postIdStr}`);
        if (storedComments) {
          const existingComments = JSON.parse(storedComments);
          const updatedComments = existingComments.filter(c => c.id !== commentId);
          localStorage.setItem(`comments_${postIdStr}`, JSON.stringify(updatedComments));
          setComments(updatedComments);
        }
        setIsDeleting(false);
        alert('Comment deleted successfully!');
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment: ' + (error.shortMessage || error.message || 'Transaction failed'));
        setIsDeleting(false);
      }
    };

    const handleEdit = async () => {
      if (!editText.trim()) return;

      setIsUpdating(true);
      try {
        const commentData = {
          content: editText.trim(),
          timestamp: Date.now(),
        };
        const ipfsHash = await uploadToIPFS(JSON.stringify(commentData));

        const postIdStr = postId.toString();
        const commentId = comment.id;
        
        console.log('Editing comment:', { postId: postId.toString(), commentId, ipfsHash });

        await editWriteContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'editComment',
          args: [postId, commentId, ipfsHash],
        });

        console.log('Comment edited successfully');

        // Update local storage
        const storedComments = localStorage.getItem(`comments_${postIdStr}`);
        if (storedComments) {
          const existingComments = JSON.parse(storedComments);
          const updatedComments = existingComments.map(c =>
            c.id === commentId ? { ...c, content: editText.trim() } : c
          );
          localStorage.setItem(`comments_${postIdStr}`, JSON.stringify(updatedComments));
          setComments(updatedComments);
        }
        setIsEditing(false);
        setIsUpdating(false);
        alert('Comment updated successfully!');
      } catch (error) {
        console.error('Error editing comment:', error);
        alert('Failed to edit comment: ' + (error.shortMessage || error.message || 'Transaction failed'));
        setIsUpdating(false);
      }
    };

    const handleLike = () => {
      if (!address || isLiking) return;

      setIsLiking(true);
      const functionName = hasLiked ? 'unlikeComment' : 'likeComment';

      likeWriteContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName,
        args: [comment.id],
      }, {
        onSuccess: () => {
          setHasLiked(!hasLiked);
          setLocalLikes(prev => hasLiked ? prev - 1 : prev + 1);
          setIsLiking(false);
        },
        onError: (error) => {
          console.error('Error liking comment:', error);
          setIsLiking(false);
        }
      });
    };

    const isOwnComment = address && comment.author.toLowerCase() === address.toLowerCase();

    return (
      <div className="comment-item">
        <div className="comment-avatar">
          {authorImage ? (
            <img src={authorImage} alt={authorUsername} />
          ) : (
            <User size={16} />
          )}
        </div>
        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-author">
              {authorUsername}
              {isOwnComment && <span className="own-badge-small">You</span>}
            </span>
            <div className="comment-actions">
              <span className="comment-timestamp">
                {formatTimestamp(comment.timestamp)}
              </span>
              {isOwnComment && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-comment-action"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-comment-action btn-delete"
                    disabled={isDeleting}
                    title="Delete"
                  >
                    {isDeleting ? <Loader2 size={14} className="spinning" /> : <Trash2 size={14} />}
                  </button>
                </>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="comment-edit-form">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="comment-edit-input"
                maxLength={280}
                disabled={isUpdating}
              />
              <div className="comment-edit-actions">
                <button
                  onClick={handleEdit}
                  className="btn-comment-save"
                  disabled={!editText.trim() || isUpdating}
                >
                  {isUpdating ? <Loader2 size={14} className="spinning" /> : <Check size={14} />}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  className="btn-comment-cancel"
                  disabled={isUpdating}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="comment-text">{renderCommentWithMentions(comment.content)}</p>
              <div className="comment-footer">
                <button
                  onClick={handleLike}
                  className={`btn-like-comment ${hasLiked ? 'liked' : ''}`}
                  disabled={isLiking || !address}
                  title={hasLiked ? 'Unlike' : 'Like'}
                >
                  <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
                  {localLikes > 0 && <span>{localLikes}</span>}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setReplyText(`@${authorUsername} `);
                  }}
                  className="btn-reply-comment"
                  disabled={!address}
                  title="Reply"
                >
                  <CornerDownRight size={14} />
                  Reply
                </button>
                {replies.length > 0 && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="btn-toggle-replies"
                  >
                    {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="reply-input-container">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to @${authorUsername}...`}
              className="reply-input"
              disabled={isSubmitting}
            />
            <button
              onClick={() => handleReply(comment.id, authorUsername)}
              disabled={isSubmitting || !replyText.trim()}
              className="btn-send-reply"
            >
              {isSubmitting ? <Loader2 size={16} className="spinning" /> : <Send size={16} />}
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              className="btn-cancel-reply"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Nested Replies */}
        {showReplies && replies.length > 0 && (
          <div className="comment-replies">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} replies={[]} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Calculate total comment count including replies
  const totalCommentCount = comments.length;

  return (
    <div className="comments-section">
      <button 
        className="btn-toggle-comments"
        onClick={() => setShowComments(!showComments)}
      >
        <MessageCircle size={16} />
        <span>{totalCommentCount} {totalCommentCount === 1 ? 'Comment' : 'Comments'}</span>
      </button>

      {showComments && (
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            (() => {
              // Organize comments into parent comments and replies
              const parentComments = comments.filter(c => !c.replyTo || c.replyTo === 0);
              const getReplies = (commentId) => comments.filter(c => c.replyTo === commentId);

              return parentComments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  replies={getReplies(comment.id)}
                />
              ));
            })()
          )}

          {isConnected && (
            <form onSubmit={handleSubmit} className="comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                maxLength={280}
                disabled={isSubmitting}
                className="comment-input"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="btn-submit-comment"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="spinning" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          )}

          {!isConnected && (
            <p className="connect-to-comment">Connect your wallet to comment</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Comments;
