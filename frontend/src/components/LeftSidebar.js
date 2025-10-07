import React, { useState } from 'react';
import { Home, TrendingUp, Users, User } from 'lucide-react';
import { useAccount } from 'wagmi';
import OnlineUsers from './OnlineUsers';
import './LeftSidebar.css';

function LeftSidebar({ activeTab, onTabChange, onProfileClick }) {
  const { isConnected } = useAccount();
  
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'communities', label: 'Communities', icon: Users },
  ];

  return (
    <div className="left-sidebar">
      <nav className="left-nav">
        {/* Profile Button */}
        {isConnected && (
          <button
            className="nav-tab profile-tab"
            onClick={onProfileClick}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        )}
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Online Users Section */}
      <div className="left-sidebar-content">
        <OnlineUsers />
      </div>
    </div>
  );
}

export default LeftSidebar;
