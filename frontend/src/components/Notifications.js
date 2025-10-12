import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { X, User, FileText, Heart, MessageCircle, AtSign, Bell } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';
import { getFromIPFS } from '../utils/ipfs';
import { contractData } from '../utils/contract';
import './Notifications.css';

function Notifications({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const { address } = useAccount();

  // Read notifications from blockchain
  const { data: blockchainNotifications, refetch: refetchNotifications } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'getUserNotifications',
    args: [address],
    enabled: !!address && isOpen,
  });

  useEffect(() => {
    if (isOpen && address) {
      loadNotifications();
    }
  }, [isOpen, address, blockchainNotifications]);

  // Helper to convert notification type number to string
  const getNotificationTypeString = (typeNum) => {
    const types = ['like', 'follow', 'comment', 'comment_like', 'mention', 'reply', 'tag'];
    return types[typeNum] || 'unknown';
  };

  const loadNotifications = () => {
    if (!address) {
      console.log('⚠️ No address, cannot load notifications');
      setNotifications([]);
      return;
    }

    console.log('📥 Loading notifications for:', address);
    console.log('📊 Blockchain notifications data:', blockchainNotifications);
    
    // PRIORITY 1: Try blockchain first (source of truth)
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
      case 'mention':
        return 'mentioned you in a post';
      case 'reply':
        return 'replied to your comment';
      case 'tag':
        return 'tagged you in a post';
      default:
        return 'interacted with you';
    }
  };

  // Watch for NotificationCreated events from smart contract to refresh the list
  useWatchContractEvent({
    address: contractData.address,
    abi: contractData.abi,
    eventName: 'NotificationCreated',
    onLogs: (logs) => {
      if (!address) return;
      
      for (const log of logs) {
        const recipient = log.args.recipient;
        if (recipient.toLowerCase() === address.toLowerCase()) {
          console.log('🔔 New notification created on blockchain, refreshing...');
          // Refetch notifications from blockchain
          setTimeout(() => {
            refetchNotifications();
          }, 1000);
        }
      }
    }
  });

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
      case 'comment_like':
        return <Heart size={20} className="notification-icon like" />;
      case 'reply':
        return <MessageCircle size={20} className="notification-icon comment" />;
      case 'tag':
        return <AtSign size={20} className="notification-icon mention" />;
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

  const modalContent = (
    <div onClick={onClose} style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'auto'
    }}>
      {/* TEST: Bright visible box */}
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '90%',
        maxWidth: '800px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '8px solid #ff0000',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        boxShadow: '0 0 50px rgba(255, 0, 0, 1), inset 0 0 50px rgba(255, 255, 0, 0.3)',
        overflow: 'hidden',
        pointerEvents: 'auto',
        padding: '40px'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '4px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fbbf24',
          minHeight: '80px'
        }}>
          <h3 style={{
            color: '#000000',
            fontSize: '32px',
            fontWeight: 900,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textShadow: 'none'
          }}>
            <Bell size={40} color="#000000" />
            <span>NOTIFICATIONS TEST</span>
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
          padding: '40px',
          minHeight: '300px',
          backgroundColor: '#10b981',
          color: '#000000',
          fontSize: '24px',
          fontWeight: 'bold'
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
              <Bell size={100} style={{ color: '#000000', marginBottom: '24px' }} />
              <p style={{ 
                color: '#000000', 
                fontSize: '32px', 
                fontWeight: 900, 
                margin: '0 0 12px 0',
                textShadow: 'none'
              }}>
                TEST: CAN YOU SEE THIS?
              </p>
              <span style={{ 
                color: '#000000', 
                fontSize: '24px',
                lineHeight: '1.6',
                fontWeight: 'bold'
              }}>
                If you see this bright box, the modal is working!<br />
                Notifications count: {notifications.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use Portal to render at document root level (ensures it's on top)
  return ReactDOM.createPortal(modalContent, document.body);
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
