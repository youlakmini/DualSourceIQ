import React from 'react';
import { FlaskIcon } from './Icons';

function SimulationView({
  params,
  handleSimChange,
  runSimulation,
  loading,
  error,
  results,
  inventory
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.25fr', gap: '14px', height: 'calc(100vh - 120px)', minHeight: 0 }}>
      {/* Parameters Column */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <h3 className="card-title">Simulation Parameters</h3>
        <p className="card-subtitle">Tune stochastic supplier parameters and risk aversion</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div className="form-group">
            <label className="form-label">Select Target Product</label>
            <select className="form-select" name="sku" value={params.sku} onChange={handleSimChange}>
              {inventory.map(item => (
                <option key={item.sku} value={item.sku}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Risk Aversion (0-1)</label>
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
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>Regular Supplier (Primary)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div className="form-group">
              <label className="form-label">Unit Cost ($)</label>
              <input type="number" min="0" className="form-input" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Mean Lead Time</label>
              <input type="number" min="0" className="form-input" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Std Dev (Days)</label>
              <input type="number" step="0.5" min="0" className="form-input" name="regular_lead_time_std" value={params.regular_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>Emergency Supplier (Backup)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div className="form-group">
              <label className="form-label">Unit Cost ($)</label>
              <input type="number" min="0" className="form-input" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Mean Lead Time</label>
              <input type="number" min="0" className="form-input" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Std Dev (Days)</label>
              <input type="number" step="0.5" min="0" className="form-input" name="emergency_lead_time_std" value={params.emergency_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
          <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ width: '100%', padding: '9px' }}>
            {loading ? 'Running 100 Monte Carlo Iterations...' : 'Run Risk-Aware Simulation (UC07)'}
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', margin: '6px 0 0 0' }}>Error: {error}</p>}
        </div>
      </div>

      {/* Recommendation Results Column */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <h3 className="card-title">Recommendation Results</h3>
        <p className="card-subtitle">Optimal dual-sourcing allocation output</p>

        {!results && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', textAlign: 'center' }}>
            <FlaskIcon />
            <p style={{ marginTop: '8px', fontSize: '13px' }}>Configure your parameters on the left and click "Run Risk-Aware Simulation" to see recommendations.</p>
          </div>
        )}

        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Blue Hero Result Card */}
            <div style={{ padding: '14px 16px', backgroundColor: '#eff6ff', borderRadius: '6px', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1d4ed8', fontWeight: '700' }}>Recommended Strategy</span>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a8a', margin: '4px 0 10px 0' }}>
                Optimal Split: {Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Emergency
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Expected Cost:</span>
                  <p style={{ margin: '1px 0 0 0', fontWeight: '700', fontSize: '14.5px', color: '#0f172a' }}>
                    ${results.best_plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Worst 5% Risk (CVaR):</span>
                  <p style={{ margin: '1px 0 0 0', fontWeight: '700', fontSize: '14.5px', color: '#0f172a' }}>
                    ${results.best_plan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Service Level (Fill Rate):</span>
                  <p style={{ margin: '1px 0 0 0', fontWeight: '700', fontSize: '14.5px', color: '#15803d' }}>
                    {(results.best_plan.expected_fill_rate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Objective Function:</span>
                  <p style={{ margin: '1px 0 0 0', fontWeight: '700', fontSize: '14.5px', color: '#0f172a' }}>
                    {results.best_plan.risk_adjusted_score.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Amber Simulation Insights */}
            <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#92400e', fontWeight: '700' }}>
                Simulation Insights (100 Monte Carlo Runs)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#78350f' }}>
                <div>Average Yearly Demand: <strong>{Math.round(results.best_plan.average_yearly_demand)} units</strong></div>
                <div>Stockout Probability: <strong>{(results.best_plan.stockout_prob * 100).toFixed(1)}%</strong></div>
                <div>Max Regular Supplier Delay: <strong>{results.best_plan.max_regular_delay} days</strong></div>
                <div>Max Emergency Supplier Delay: <strong>{results.best_plan.max_emergency_delay} days</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulationView;
