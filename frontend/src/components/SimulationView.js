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
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '24px' }}>
      {/* Parameters Column */}
      <div className="dashboard-card">
        <h3 className="card-title">Simulation Parameters</h3>
        <p className="card-subtitle">Tune stochastic supplier parameters and risk aversion</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', marginBottom: '20px' }}>
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

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '18px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Regular Supplier (Primary)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
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

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Emergency Supplier (Backup)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
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

        <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Running 100 Monte Carlo Iterations...' : 'Run Risk-Aware Simulation (UC07)'}
        </button>
        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>Error: {error}</p>}
      </div>

      {/* Recommendation Results Column */}
      <div className="dashboard-card">
        <h3 className="card-title">Recommendation Results</h3>
        <p className="card-subtitle">Optimal dual-sourcing allocation output</p>

        {!results && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <FlaskIcon />
            <p style={{ marginTop: '12px', fontSize: '14px' }}>Configure your parameters on the left and click "Run Risk-Aware Simulation" to see recommendations.</p>
          </div>
        )}

        {results && (
          <div>
            {/* Blue Hero Result Card */}
            <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '5px solid #2563eb', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1d4ed8', fontWeight: '700' }}>Recommended Strategy</span>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a8a', margin: '6px 0 16px 0' }}>
                Optimal Split: {Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Emergency
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Expected Cost:</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                    ${results.best_plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Worst 5% Risk (CVaR):</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                    ${results.best_plan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Service Level (Fill Rate):</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#15803d' }}>
                    {(results.best_plan.expected_fill_rate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Objective Function:</span>
                  <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                    {results.best_plan.risk_adjusted_score.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Amber Simulation Insights */}
            <div style={{ padding: '18px', backgroundColor: '#fffbeb', borderRadius: '8px', borderLeft: '5px solid #f59e0b' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#92400e', fontWeight: '700' }}>
                Simulation Insights (100 Monte Carlo Runs)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13.5px', color: '#78350f' }}>
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
