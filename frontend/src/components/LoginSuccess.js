import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import './LoginSuccess.css';

function LoginSuccess({ username, onComplete }) {
  useEffect(() => {
    // Auto-close after animation completes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="login-success-overlay">
      <div className="login-success-container">
        <div className="success-icon-wrapper">
          <CheckCircle className="success-icon" size={80} />
          <div className="success-circle"></div>
        </div>
        <h2 className="success-title">Welcome Back!</h2>
        <p className="success-message">
          Successfully logged in as <span className="success-username">@{username}</span>
        </p>
        <div className="success-loader">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginSuccess;
