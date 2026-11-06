import React from 'react';
import { DualSourceIQLogo, BellIcon, UserIcon } from './Icons';

function Navbar() {
  return (
    <header className="top-navbar">
      <div className="brand-section">
        <DualSourceIQLogo size={32} />
        <div className="brand-text-wrapper">
          <span className="brand-title">
            DualSource<span className="brand-accent">IQ</span>
          </span>
          <span className="brand-divider">|</span>
          <span className="brand-subtitle">Smart Dual-Supplier Decision Support</span>
        </div>
      </div>
      <div className="navbar-actions">
        <button className="notification-btn" title="Notifications">
          <BellIcon />
          <span className="notification-badge">3</span>
        </button>
        <div className="user-profile-widget">
          <div className="user-avatar-circle">
            <UserIcon />
          </div>
          <span className="user-name-text">Inventory Manager</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94a3b8' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
