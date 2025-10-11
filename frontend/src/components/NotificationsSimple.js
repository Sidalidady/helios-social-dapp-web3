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
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          border: '2px solid rgba(59, 130, 246, 0.5)',
          boxShadow: '0 25px 80px rgba(59, 130, 246, 0.3), 0 0 100px rgba(139, 92, 246, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 30px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
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
            <Bell size={28} color="#60a5fa" />
            Notifications ({notifications.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '10px',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
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
            backgroundColor: '#0f172a',
          }}
        >
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div
                key={index}
                style={{
                  padding: '15px 20px',
                  marginBottom: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <p style={{ margin: 0, color: '#e5e7eb', fontSize: '16px', fontWeight: '500' }}>
                  {notif.message || 'New notification'}
                </p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
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
              <Bell size={80} style={{ color: '#475569', marginBottom: '20px' }} />
              <h3 style={{ color: '#e2e8f0', fontSize: '20px', margin: '0 0 10px 0', fontWeight: '700' }}>
                No notifications yet
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
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
