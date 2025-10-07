import React from 'react';
import { User, LogIn, UserPlus } from 'lucide-react';
import './WelcomeChoice.css';

function WelcomeChoice({ onCreateAccount, onLogin }) {
  return (
    <div className="welcome-choice-overlay">
      <div className="welcome-choice-modal">
        <div className="welcome-choice-header">
          <div className="welcome-choice-icon">
            <User size={32} />
          </div>
          <h2>Welcome to Helios Social</h2>
          <p className="welcome-choice-subtitle">
            Choose an option to continue
          </p>
        </div>

        <div className="welcome-choice-options">
          <button className="choice-button create" onClick={onCreateAccount}>
            <UserPlus size={24} />
            <div className="choice-content">
              <h3>Create Account</h3>
              <p>Set up a new profile with this wallet</p>
            </div>
          </button>

          <button className="choice-button login" onClick={onLogin}>
            <LogIn size={24} />
            <div className="choice-content">
              <h3>Login</h3>
              <p>Access your existing account</p>
            </div>
          </button>
        </div>

        <p className="welcome-choice-note">
          Your wallet address will be linked to your account
        </p>
      </div>
    </div>
  );
}

export default WelcomeChoice;
