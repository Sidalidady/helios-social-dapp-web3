import React from 'react';
import ReactDOM from 'react-dom';
import { X, Bell } from 'lucide-react';

function NotificationsSimple({ isOpen, onClose, notifications = [] }) {
  if (!isOpen) return null;

  console.log('🔔 NOTIFICATIONS PANEL RENDERING');
  console.log('📋 Notifications:', notifications);

  const content = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '5px solid #3b82f6',
          boxShadow: '0 0 100px rgba(59, 130, 246, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 30px',
            backgroundColor: '#3b82f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Bell size={28} />
            Notifications ({notifications.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '30px',
            maxHeight: '500px',
            overflowY: 'auto',
            backgroundColor: '#f3f4f6',
          }}
        >
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                }}
              >
                <p style={{ margin: 0, color: '#111827', fontSize: '16px' }}>
                  {notif.message || 'New notification'}
                </p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {notif.timestamp || 'Just now'}
                </span>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
              }}
            >
              <Bell size={80} style={{ color: '#9ca3af', marginBottom: '20px' }} />
              <h3 style={{ color: '#111827', fontSize: '20px', margin: '0 0 10px 0' }}>
                No notifications yet
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                When someone follows you or interacts with your posts,
                <br />
                you'll see notifications here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

export default NotificationsSimple;
