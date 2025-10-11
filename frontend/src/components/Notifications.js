import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { X, User, FileText, Heart, MessageCircle, AtSign, Bell } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';
import { getFromIPFS } from '../utils/ipfs';
import { contractData } from '../utils/contract';
import './Notifications.css';

function Notifications({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const { address } = useAccount();

  useEffect(() => {
    if (isOpen && address) {
      loadNotifications();
    }
  }, [isOpen, address, blockchainNotifications]);

  // Read notifications from blockchain
  const { data: blockchainNotifications, refetch: refetchNotifications } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserNotifications',
    args: [address],
    enabled: !!address,
  });

  // Helper to convert notification type number to string
  const getNotificationTypeString = (typeNum) => {
    const types = ['like', 'follow', 'comment', 'comment_like'];
    return types[typeNum] || 'unknown';
  };

  const loadNotifications = () => {
    // Load notifications from blockchain
    console.log('📥 Loading notifications from blockchain for:', address);
    console.log('📊 Blockchain notifications data:', blockchainNotifications);
    
    if (blockchainNotifications && blockchainNotifications.length > 0) {
      console.log('✅ Loaded', blockchainNotifications.length, 'notifications from blockchain');
      
      // Convert blockchain data to frontend format
      const formattedNotifications = blockchainNotifications.map((notif, index) => {
        const typeString = getNotificationTypeString(Number(notif.notificationType));
        console.log(`📋 Notification ${index}:`, {
          type: typeString,
          sender: notif.sender,
          timestamp: Number(notif.timestamp),
          read: notif.read
        });
        return {
          id: index,
          type: typeString,
          from: notif.sender,
          message: getNotificationMessage(typeString),
          postId: Number(notif.relatedId).toString(),
          timestamp: Number(notif.timestamp) * 1000,
          read: notif.read
        };
      }).reverse(); // Reverse to show newest first
      
      setNotifications(formattedNotifications);
      console.log('✅ Notifications loaded into state:', formattedNotifications.length);
    } else {
      console.log('📭 No notifications found on blockchain');
      
      // Fallback: Try loading from localStorage for backward compatibility
      const stored = localStorage.getItem(`notifications_${address}`);
      if (stored) {
        try {
          const localNotifications = JSON.parse(stored);
          console.log('📦 Loaded', localNotifications.length, 'notifications from localStorage (fallback)');
          setNotifications(localNotifications);
        } catch (error) {
          console.error('❌ Error parsing localStorage notifications:', error);
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    }
  };

  const clearNotifications = async () => {
    // Clear notifications on blockchain (keep last 50)
    try {
      const { writeContract } = await import('wagmi/actions');
      const { config } = await import('../config/wagmi');
      
      await writeContract(config, {
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'clearOldNotifications',
        args: [50],
      });
      
      console.log('🗑️ Cleared old notifications on blockchain');
      refetchNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const markAsRead = async (notificationIndex) => {
    try {
      const { writeContract } = await import('wagmi/actions');
      const { config } = await import('../config/wagmi');
      
      await writeContract(config, {
        address: contractData.address,
        abi: contractData.abi,
        functionName: 'markNotificationAsRead',
        args: [notificationIndex],
      });
      
      console.log('✅ Marked notification as read on blockchain');
      refetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Get user's profile
  const { data: userProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address,
  });

  // Watch for NotificationCreated events from smart contract
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'NotificationCreated',
    onLogs: async (logs) => {
      if (!address) {
        console.log('⚠️ No address, skipping notification');
        return;
      }

      console.log('🔔 NotificationCreated event received:', logs.length, 'events');

      for (const log of logs) {
        try {
          const recipient = log.args.recipient;

          // Only process if notification is for current user
          if (recipient.toLowerCase() !== address.toLowerCase()) {
            console.log('⏭️ Notification not for current user');
            continue;
          }

          console.log('✅ New notification for you! Refetching from blockchain...');
          console.log('📋 Notification details:', {
            recipient: log.args.recipient,
            sender: log.args.sender,
            type: log.args.notificationType,
            relatedId: log.args.relatedId?.toString()
          });
          
          // Refetch notifications from blockchain
          await refetchNotifications();
          
          // Force reload after a short delay to ensure blockchain is updated
          setTimeout(() => {
            refetchNotifications();
          }, 2000);
          
        } catch (error) {
          console.error('❌ Error processing notification:', error);
        }
      }
    }
  });

  // Helper function to get notification message
  const getNotificationMessage = (type) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'follow':
        return 'started following you';
      case 'comment':
        return 'commented on your post';
      case 'comment_like':
        return 'liked your comment';
      default:
        return 'interacted with you';
    }
  };

  // Keep old event watchers as backup (will be removed later)
  // Watch for post likes
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'PostLiked',
    onLogs: async (logs) => {
      if (!address) {
        console.log('⚠️ No address, skipping like notification');
        return;
      }

      console.log('❤️ PostLiked event received:', logs.length, 'events');

      for (const log of logs) {
        try {
          const postId = log.args.postId;
          const liker = log.args.liker;

          console.log('Processing like:', { postId: postId?.toString(), liker, currentUser: address });

          // Don't notify if you liked your own post
          if (liker.toLowerCase() === address.toLowerCase()) {
            console.log('⏭️ Skipping - you liked your own post');
            continue;
          }

          // Get the post to check if it's yours
          const { readContract } = await import('wagmi/actions');
          const { config } = await import('../config/wagmi');
          
          const post = await readContract(config, {
            address: contractData.address,
            abi: contractData.abi,
            functionName: 'getPost',
            args: [postId],
          });

          console.log('Post author:', post?.author, 'Your address:', address);

          // If this is your post, add notification
          if (post && post.author.toLowerCase() === address.toLowerCase()) {
            console.log('✅ Adding like notification!');
            
            const notification = {
              id: Date.now() + Math.random(),
              type: 'like',
              from: liker,
              message: 'liked your post',
              postId: postId.toString(),
              timestamp: Date.now(),
              read: false
            };

            // Save directly to localStorage
            const stored = localStorage.getItem(`notifications_${address}`);
            const existing = stored ? JSON.parse(stored) : [];
            const updated = [notification, ...existing].slice(0, 50);
            localStorage.setItem(`notifications_${address}`, JSON.stringify(updated));
            
            console.log('💾 Notification saved to localStorage');
            
            // Update state
            setNotifications(updated);
          } else {
            console.log('⏭️ Not your post, skipping notification');
          }
        } catch (error) {
          console.error('❌ Error processing like notification:', error);
        }
      }
    }
  });

  // Watch for follows
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'UserFollowed',
    onLogs: (logs) => {
      if (!address) {
        console.log('⚠️ No address, skipping follow notification');
        return;
      }

      console.log('👥 UserFollowed event received:', logs.length, 'events');

      for (const log of logs) {
        try {
          const follower = log.args.follower;
          const followed = log.args.followed;

          console.log('Processing follow:', { follower, followed, currentUser: address });

          // If someone followed you, add notification
          if (followed.toLowerCase() === address.toLowerCase() && 
              follower.toLowerCase() !== address.toLowerCase()) {
            console.log('✅ Adding follow notification!');
            
            const notification = {
              id: Date.now() + Math.random(),
              type: 'follow',
              from: follower,
              message: 'started following you',
              timestamp: Date.now(),
              read: false
            };

            // Save directly to localStorage
            const stored = localStorage.getItem(`notifications_${address}`);
            const existing = stored ? JSON.parse(stored) : [];
            const updated = [notification, ...existing].slice(0, 50);
            localStorage.setItem(`notifications_${address}`, JSON.stringify(updated));
            
            console.log('💾 Follow notification saved to localStorage');
            
            // Update state
            setNotifications(updated);
          } else {
            console.log('⏭️ Not following you, skipping notification');
          }
        } catch (error) {
          console.error('❌ Error processing follow notification:', error);
        }
      }
    }
  });

  // Watch for new comments to detect mentions
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'CommentAdded',
    onLogs: async (logs) => {
      if (!address || !userProfile || !userProfile.displayName) return;

      const username = userProfile.displayName.toLowerCase();

      // Check each comment for mentions
      for (const log of logs) {
        try {
          const ipfsHash = log.args.ipfsHash;
          const commenter = log.args.commenter;
          const postId = log.args.postId;

          // Don't notify if you mentioned yourself
          if (commenter.toLowerCase() === address.toLowerCase()) continue;

          // Fetch comment content
          const commentData = await getFromIPFS(ipfsHash);
          const content = commentData.content || '';

          // Check if comment mentions this user
          const mentionRegex = new RegExp(`@${username}\\b`, 'i');
          if (mentionRegex.test(content)) {
            // Add notification
            addNotification({
              id: Date.now() + Math.random(),
              type: 'mention',
              from: commenter,
              fromName: 'Someone',
              message: `mentioned you in a comment`,
              content: content.substring(0, 100),
              postId: postId.toString(),
              timestamp: Date.now(),
              read: false
            });
          }
        } catch (error) {
          console.error('Error processing mention:', error);
        }
      }
    }
  });

  const addNotification = (notification) => {
    const stored = localStorage.getItem(`notifications_${address}`);
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [notification, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(`notifications_${address}`, JSON.stringify(updated));
    setNotifications(updated);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return <AtSign size={20} className="notification-icon mention" />;
      case 'follow':
        return <User size={20} className="notification-icon follow" />;
      case 'post':
        return <FileText size={20} className="notification-icon post" />;
      case 'like':
        return <Heart size={20} className="notification-icon like" />;
      case 'comment':
        return <MessageCircle size={20} className="notification-icon comment" />;
      default:
        return <User size={20} className="notification-icon" />;
    }
  };

  const NotificationItem = ({ notification }) => {
    const [authorUsername, setAuthorUsername] = useState('');
    const [authorImage, setAuthorImage] = useState('');

    // Get author's profile
    const { data: authorProfile } = useReadContract({
      address: contractData.address,
      abi: contractData.abi,
      functionName: 'getUserProfile',
      args: [notification.from],
      enabled: !!notification.from,
    });

    useEffect(() => {
      const loadAuthorProfile = async () => {
        if (authorProfile && authorProfile[0]) {
          setAuthorUsername(authorProfile[0]);
          
          const ipfsHash = authorProfile[1];
          if (ipfsHash) {
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

    return (
      <div 
        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
        onClick={() => markAsRead(notification.id)}
      >
        <div className="notification-avatar">
          {authorImage ? (
            <img src={authorImage} alt={authorUsername} />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="notification-content">
          <div className="notification-header">
            {getNotificationIcon(notification.type)}
            <span className="notification-username">@{authorUsername}</span>
          </div>
          <p className="notification-message">{notification.message}</p>
          <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
        </div>
        {!notification.read && <div className="unread-dot"></div>}
      </div>
    );
  };

  if (!isOpen) return null;

  console.log('🔔 ========== NOTIFICATIONS PANEL ==========');
  console.log('📊 Rendering notifications panel');
  console.log('📋 Notifications count:', notifications.length);
  console.log('📋 Notifications data:', notifications);
  console.log('👤 Current address:', address);
  console.log('🔔 ==========================================');

  return (
    <div onClick={onClose} style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(4px)'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '90%',
        maxWidth: '800px',
        backgroundColor: '#1e293b',
        borderRadius: '24px',
        border: '3px solid #3b82f6',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5), 0 20px 60px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid #3b82f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#334155',
          minHeight: '80px'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: 800,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <Bell size={32} color="#3b82f6" />
            <span>Notifications</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                Clear all
              </button>
            )}
            <button onClick={onClose} style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          minHeight: '300px',
          backgroundColor: '#0f172a'
        }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 32px',
              textAlign: 'center',
              minHeight: '400px'
            }}>
              <Bell size={80} style={{ color: '#475569', marginBottom: '24px' }} />
              <p style={{ 
                color: '#e2e8f0', 
                fontSize: '20px', 
                fontWeight: 700, 
                margin: '0 0 12px 0',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                No notifications yet
              </p>
              <span style={{ 
                color: '#94a3b8', 
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                When someone follows you or interacts with your posts,<br />
                you'll see notifications here
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to add notification (call this from other components)
export const addNotification = (userAddress, notification) => {
  const stored = localStorage.getItem(`notifications_${userAddress}`);
  const existing = stored ? JSON.parse(stored) : [];
  
  const newNotification = {
    id: Date.now(),
    read: false,
    timestamp: Date.now(),
    ...notification,
  };
  
  const updated = [newNotification, ...existing].slice(0, 50); // Keep last 50
  localStorage.setItem(`notifications_${userAddress}`, JSON.stringify(updated));
  
  // Return count of unread notifications
  return updated.filter(n => !n.read).length;
};

// Get unread count from blockchain
export const getUnreadCount = async (userAddress, contractAddress, abi) => {
  try {
    // Try to get from blockchain first
    if (contractAddress && abi) {
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('../config/wagmi');
      
      const count = await readContract(config, {
        address: contractAddress,
        abi: abi,
        functionName: 'getUnreadNotificationCount',
        args: [userAddress],
      });
      
      return Number(count);
    }
  } catch (error) {
    console.error('Error getting unread count from blockchain:', error);
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(`notifications_${userAddress}`);
  if (!stored) return 0;
  
  try {
    const notifications = JSON.parse(stored);
    return notifications.filter(n => !n.read).length;
  } catch {
    return 0;
  }
};

export default Notifications;
