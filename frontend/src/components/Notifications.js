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
  }, [isOpen, address]);

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
    
    if (blockchainNotifications && blockchainNotifications.length > 0) {
      console.log('✅ Loaded', blockchainNotifications.length, 'notifications from blockchain');
      
      // Convert blockchain data to frontend format
      const formattedNotifications = blockchainNotifications.map((notif, index) => {
        const typeString = getNotificationTypeString(Number(notif.notificationType));
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
    } else {
      console.log('📭 No notifications found on blockchain');
      setNotifications([]);
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

          console.log('✅ New notification! Refetching from blockchain...');
          
          // Refetch notifications from blockchain
          refetchNotifications();
          
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

  console.log('Rendering notifications, count:', notifications.length);

  return (
    <div className="notifications-dropdown" onClick={onClose}>
      <div className="notifications-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h3>
            <Bell size={28} />
            Notifications
          </h3>
          <div className="notifications-actions">
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="btn-clear">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="btn-close-notifications">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="no-notifications">
              <Bell size={64} className="empty-icon" />
              <p>No notifications yet</p>
              <span>When someone interacts with your posts, you'll see it here</span>
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

// Get unread count
export const getUnreadCount = (userAddress) => {
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
