import React from 'react';
import { 
  DashboardIcon, 
  BoxIcon, 
  UsersIcon, 
  TrendingIcon, 
  FlaskIcon, 
  FileTextIcon, 
  UserIcon 
} from './Icons';

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'inventory', label: 'Manage Inventory Data', icon: <BoxIcon /> },
    { id: 'simulation', label: 'Manage Supplier Parameters', icon: <UsersIcon /> },
    { id: 'forecast', label: 'View Demand Forecast', icon: <TrendingIcon /> },
    { id: 'whatif', label: 'Run What-if Analysis', icon: <FlaskIcon /> },
    { id: 'reports', label: 'Reports & Metrics', icon: <FileTextIcon /> },
  ];

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav-list">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar-circle" style={{ width: '32px', height: '32px' }}>
          <UserIcon />
        </div>
        <div className="sidebar-footer-info">
          <span className="sidebar-footer-name">Inventory Manager</span>
          <span className="sidebar-footer-role">Inventory Management</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
