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

  const loadNotifications = () => {
    // Load notifications from localStorage
    console.log('Loading notifications for address:', address);
    const stored = localStorage.getItem(`notifications_${address}`);
    console.log('Stored notifications:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed notifications:', parsed);
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
    } else {
      console.log('No notifications found in localStorage');
      setNotifications([]);
    }
  };

  const clearNotifications = () => {
    localStorage.removeItem(`notifications_${address}`);
    setNotifications([]);
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${address}`, JSON.stringify(updated));
  };

  // Get user's profile
  const { data: userProfile } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserProfile',
    args: [address],
    enabled: !!address,
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
              id: Date.now(),
              type: 'mention',
              from: commenter,
              fromName: 'Someone',
              message: `Someone mentioned you in a comment`,
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
