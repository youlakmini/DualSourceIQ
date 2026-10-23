import React from 'react';
import { FileTextIcon } from './Icons';

function ReportsView() {
  return (
    <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
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
          <FileTextIcon />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
          Reports & Performance Metrics
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
          Exportable audit logs, supplier SLA tracking, and historical CVaR risk reports will be generated from this view.
        </p>
      </div>
    </div>
  );
}

export default ReportsView;
