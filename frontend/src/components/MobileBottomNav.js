import React from 'react';
import { Home, TrendingUp, Users, User, Bell } from 'lucide-react';
import './MobileBottomNav.css';

function MobileBottomNav({ activeView, onViewChange, unreadCount = 0 }) {
  const navItems = [
    { id: 'feed', icon: Home, label: 'Home' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            aria-label={item.label}
          >
            <div className="mobile-nav-icon-wrapper">
              <Icon size={24} />
              {item.badge > 0 && (
                <span className="mobile-nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
