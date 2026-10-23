import React from 'react';

function WhatIfView({
  params,
  handleSimChange,
  runSimulation,
  loading,
  error,
  results,
  inventory
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="dashboard-card">
        <h3 className="card-title">What-If Scenario Simulation</h3>
        <p className="card-subtitle">Stress-test inventory policies under demand surges and lead-time disruptions</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Target Product</label>
            <select className="form-select" name="sku" value={params.sku} onChange={handleSimChange}>
              {inventory.map(item => <option key={item.sku} value={item.sku}>{item.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Risk Aversion λ (0 - 1)</label>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="1" 
              className="form-input" 
              name="risk_aversion" 
              value={params.risk_aversion} 
              onChange={handleSimChange} 
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Demand Surge / Drop (%)</label>
            <input 
              type="number" 
              step="1" 
              min="-99" 
              max="500" 
              className="form-input" 
              name="demand_modifier_pct" 
              value={params.demand_modifier_pct} 
              onChange={handleSimChange} 
              placeholder="e.g. +20 for 20% spike" 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Regular Supplier Parameters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Unit Cost ($)</label>
                <input type="number" min="0" className="form-input" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Mean Lead Time (Days)</label>
                <input type="number" min="0" className="form-input" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange} />
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Emergency Supplier Parameters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Unit Cost ($)</label>
                <input type="number" min="0" className="form-input" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Mean Lead Time (Days)</label>
                <input type="number" min="0" className="form-input" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange} />
              </div>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#f59e0b' }}>
          {loading ? 'Evaluating Scenario Candidates...' : 'Run What-If Strategy Comparison (UC05.1)'}
        </button>
        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>Error: {error}</p>}
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Compare Sourcing Strategies (UC05.1)</h3>
        <p className="card-subtitle">Comparison of baseline allocations vs. risk-optimized allocation</p>

        {!results && (
          <p style={{ color: '#94a3b8', fontSize: '14px', padding: '20px 0' }}>Adjust what-if parameters above and click Run to see the strategy comparison table.</p>
        )}

        {results && results.all_plans && (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Strategy (Reg / Emg)</th>
                  <th>Expected Cost</th>
                  <th>Service Level (Fill Rate)</th>
                  <th>Risk (Worst 5% CVaR)</th>
                  <th>Risk-Adjusted Objective</th>
                  <th>Recommendation Status</th>
                </tr>
              </thead>
              <tbody>
                {results.all_plans.filter(p => p.primary_ratio === 1.0 || p.primary_ratio === 0.0 || p.primary_ratio === 0.5 || p.primary_ratio === results.best_plan.primary_ratio).map((plan, idx) => {
                  const isBest = plan.primary_ratio === results.best_plan.primary_ratio;
                  const name = plan.primary_ratio === 1.0 ? 'Regular Only (100% / 0%)' : 
                               plan.primary_ratio === 0.0 ? 'Emergency Only (0% / 100%)' : 
                               plan.primary_ratio === 0.5 ? 'Balanced (50% / 50%)' : 
                               `Risk-Aware (${Math.round(plan.primary_ratio*100)}% / ${Math.round((1-plan.primary_ratio)*100)}%)`;
                  
                  return (
                    <tr key={idx} style={{ backgroundColor: isBest ? '#eff6ff' : 'transparent', fontWeight: isBest ? '600' : 'normal' }}>
                      <td style={{ color: isBest ? '#1d4ed8' : 'inherit' }}>{name}</td>
                      <td>${plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ color: plan.expected_fill_rate >= 0.95 ? '#166534' : '#991b1b', fontWeight: '600' }}>
                        {(plan.expected_fill_rate * 100).toFixed(1)}%
                      </td>
                      <td>${plan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{plan.risk_adjusted_score.toFixed(2)}</td>
                      <td>
                        {isBest ? (
                          <span className="badge-pill badge-healthy" style={{ padding: '4px 12px' }}>
                            ⭐ Optimal Choice
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>Alternative</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatIfView;
