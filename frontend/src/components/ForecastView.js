import React from 'react';
import { TrendingIcon } from './Icons';

function ForecastView() {
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
          <TrendingIcon />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
          Demand Forecast (XGBoost)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
          Interactive demand forecasting and trend charts for M5 Walmart products will be displayed here in the upcoming module.
        </p>
      </div>
    </div>
  );
}

export default ForecastView;
