import React, { useEffect } from 'react';
import { CheckCircle, User } from 'lucide-react';
import './WelcomeBack.css';

function WelcomeBack({ username, profileImage, onClose }) {
  useEffect(() => {
    // Auto close after 2 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="welcome-back-overlay">
      <div className="welcome-back-modal">
        <CheckCircle size={48} className="welcome-icon" />
        <div className="welcome-avatar">
          {profileImage ? (
            <img src={profileImage} alt={username} />
          ) : (
            <User size={32} />
          )}
        </div>
        <h2>Welcome Back!</h2>
        <p className="welcome-username">@{username}</p>
        <p className="welcome-message">Successfully logged in</p>
      </div>
    </div>
  );
}

export default WelcomeBack;
