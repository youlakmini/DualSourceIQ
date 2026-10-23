import React from 'react';
import { DashboardIcon, BoxIcon, FlaskIcon } from './Icons';

function DashboardView({ setActiveTab }) {
  return (
    <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div 
          style={{ 
            width: '56px', 
            height: '56px', 
            backgroundColor: '#eff6ff', 
            color: '#2563eb', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px auto' 
          }}
        >
          <DashboardIcon />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
          Overview Dashboard In Progress
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
          The central KPI overview dashboard is currently queued for the next release. Please use the options in the sidebar to manage your items or run simulations.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => setActiveTab('inventory')}>
            <BoxIcon />
            <span>Manage Inventory Data</span>
          </button>
          <button className="btn-secondary" onClick={() => setActiveTab('whatif')}>
            <FlaskIcon />
            <span>Run What-if Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
