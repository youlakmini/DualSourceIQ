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
  // Calculation helpers for results
  const bestPlan = results?.best_plan;
  const regPct = bestPlan ? Math.round(bestPlan.primary_ratio * 100) : 0;
  const emgPct = bestPlan ? Math.round((1 - bestPlan.primary_ratio) * 100) : 0;
  const fillRatePct = bestPlan ? (bestPlan.expected_fill_rate * 100).toFixed(1) : '0';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.25fr', gap: '14px', height: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Parameters Column */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '14px 18px', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '10px', flexShrink: 0 }}>
          <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>Supplier Risk Parameters</h3>
          <p className="card-subtitle" style={{ margin: '2px 0 0 0', fontSize: '11.5px' }}>
            Configure supplier reliability, lead times, and risk appetite
          </p>
        </div>

        {/* Target Product (Full Width) */}
        <div className="form-group" style={{ marginBottom: '10px', flexShrink: 0, width: '100%' }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: '11.5px', marginBottom: '3px' }}>Target Product</label>
          <select className="form-select" name="sku" value={params.sku} onChange={handleSimChange} style={{ width: '100%', padding: '6px 10px', fontSize: '12px', boxSizing: 'border-box' }}>
            {inventory.map(item => (
              <option key={item.sku} value={item.sku}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Risk Preference (Full Width, Perfectly Aligned) */}
        <div style={{ marginBottom: '12px', flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '11.5px' }}>
              Risk Preference (0 - 1)
            </label>
            <span style={{ fontSize: '10.5px', color: params.risk_aversion <= 0.3 ? '#2563eb' : params.risk_aversion >= 0.7 ? '#15803d' : '#b45309', fontWeight: 600 }}>
              {params.risk_aversion <= 0.3 ? '💰 Cost Saver' : params.risk_aversion >= 0.7 ? '🛡️ Safe Buffer' : '⚖️ Balanced'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              <button
                type="button"
                onClick={() => handleSimChange({ target: { name: 'risk_aversion', value: 0.2 } })}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  padding: '5px 4px',
                  borderRadius: '5px',
                  border: '1px solid',
                  borderColor: params.risk_aversion <= 0.3 ? '#3b82f6' : '#cbd5e1',
                  background: params.risk_aversion <= 0.3 ? '#eff6ff' : '#ffffff',
                  color: params.risk_aversion <= 0.3 ? '#1d4ed8' : '#475569',
                  fontWeight: params.risk_aversion <= 0.3 ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Prioritize low purchasing cost (0.2)"
              >
                Cost Saver
              </button>
              <button
                type="button"
                onClick={() => handleSimChange({ target: { name: 'risk_aversion', value: 0.5 } })}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  padding: '5px 4px',
                  borderRadius: '5px',
                  border: '1px solid',
                  borderColor: params.risk_aversion > 0.3 && params.risk_aversion < 0.7 ? '#3b82f6' : '#cbd5e1',
                  background: params.risk_aversion > 0.3 && params.risk_aversion < 0.7 ? '#eff6ff' : '#ffffff',
                  color: params.risk_aversion > 0.3 && params.risk_aversion < 0.7 ? '#1d4ed8' : '#475569',
                  fontWeight: params.risk_aversion > 0.3 && params.risk_aversion < 0.7 ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Balanced risk-cost trade-off (0.5)"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => handleSimChange({ target: { name: 'risk_aversion', value: 0.8 } })}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  padding: '5px 4px',
                  borderRadius: '5px',
                  border: '1px solid',
                  borderColor: params.risk_aversion >= 0.7 ? '#3b82f6' : '#cbd5e1',
                  background: params.risk_aversion >= 0.7 ? '#eff6ff' : '#ffffff',
                  color: params.risk_aversion >= 0.7 ? '#1d4ed8' : '#475569',
                  fontWeight: params.risk_aversion >= 0.7 ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Maximum protection against stockouts (0.8)"
              >
                Safe Buffer
              </button>
            </div>

            <input 
              type="number" 
              step="0.05" 
              min="0" 
              max="1" 
              className="form-input" 
              name="risk_aversion" 
              value={params.risk_aversion} 
              onChange={handleSimChange} 
              style={{ width: '68px', padding: '5px 6px', fontSize: '12px', textAlign: 'center', fontWeight: 600, boxSizing: 'border-box' }}
              title="Custom risk aversion value between 0.0 and 1.0"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
            />
          </div>
        </div>

        {/* Side-by-Side Supplier Grid (Compact Length & Width, Symmetrical Breathing Room) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
          gap: '10px', 
          marginBottom: '12px', 
          flexShrink: 0, 
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Supplier 1: Regular / Global */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '8px 10px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block', flexShrink: 0 }}></span>
                <strong style={{ fontSize: '11px', color: '#0f172a' }}>Supplier 1 (Regular)</strong>
              </div>
              <span style={{ fontSize: '9px', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                Low Cost &bull; Bulk
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '1px' }}>Unit Purchase Cost</span>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '7px', top: '4px', fontSize: '11px', color: '#94a3b8' }}>$</span>
                  <input type="number" min="0" className="form-input" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} style={{ padding: '3px 6px 3px 17px', fontSize: '11.5px', height: '28px', boxSizing: 'border-box', width: '100%' }} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '1px' }}>Average Lead Time</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" className="form-input" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} style={{ padding: '3px 28px 3px 7px', fontSize: '11.5px', height: '28px', boxSizing: 'border-box', width: '100%' }} />
                  <span style={{ position: 'absolute', right: '7px', top: '4px', fontSize: '10px', color: '#94a3b8' }}>days</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '1px' }}>Delivery Uncertainty</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.5" min="0" className="form-input" name="regular_lead_time_std" value={params.regular_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} style={{ padding: '3px 32px 3px 7px', fontSize: '11.5px', height: '28px', boxSizing: 'border-box', width: '100%' }} />
                  <span style={{ position: 'absolute', right: '7px', top: '4px', fontSize: '10px', color: '#94a3b8' }}>&plusmn; days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier 2: Emergency / Local Express */}
          <div style={{
            backgroundColor: '#fffdf5',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            padding: '8px 10px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', flexShrink: 0 }}></span>
                <strong style={{ fontSize: '11px', color: '#0f172a' }}>Supplier 2 (Express)</strong>
              </div>
              <span style={{ fontSize: '9px', color: '#854d0e', backgroundColor: '#fefce8', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, border: '1px solid #fef08a', whiteSpace: 'nowrap' }}>
                Rapid &bull; Buffer
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '1px' }}>Unit Purchase Cost</span>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '7px', top: '4px', fontSize: '11px', color: '#94a3b8' }}>$</span>
                  <input type="number" min="0" className="form-input" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} style={{ padding: '3px 6px 3px 17px', fontSize: '11.5px', height: '28px', boxSizing: 'border-box', width: '100%' }} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '1px' }}>Average Lead Time</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" className="form-input" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} style={{ padding: '3px 28px 3px 7px', fontSize: '11.5px', height: '28px', boxSizing: 'border-box', width: '100%' }} />
                  <span style={{ position: 'absolute', right: '7px', top: '4px', fontSize: '10px', color: '#94a3b8' }}>days</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '1px' }}>Delivery Uncertainty</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.5" min="0" className="form-input" name="emergency_lead_time_std" value={params.emergency_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} style={{ padding: '3px 32px 3px 7px', fontSize: '11.5px', height: '28px', boxSizing: 'border-box', width: '100%' }} />
                  <span style={{ position: 'absolute', right: '7px', top: '4px', fontSize: '10px', color: '#94a3b8' }}>&plusmn; days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Error */}
        <div style={{ marginTop: 'auto', paddingTop: '6px', flexShrink: 0 }}>
          <button 
            className="btn-primary" 
            onClick={runSimulation} 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '9px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Simulating 500 Disruption Scenarios...' : '⚡ Run Risk Simulation'}
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', margin: '6px 0 0 0' }}>Error: {error}</p>}
        </div>
        </div>
      </div>

      {/* Recommendation Results Column */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '14px 18px', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '10px', flexShrink: 0 }}>
          <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>Sourcing Strategy Recommendation</h3>
          <p className="card-subtitle" style={{ margin: '2px 0 0 0', fontSize: '11.5px' }}>
            Risk-optimized dual-sourcing allocation output
          </p>
        </div>

        {!results && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
            <FlaskIcon />
            <h4 style={{ margin: '12px 0 4px 0', fontSize: '14px', color: '#475569', fontWeight: 600 }}>Ready to Simulate</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', maxWidth: '340px' }}>
              Configure your supplier costs, lead times, and uncertainty on the left, then click <strong>"Run Risk Simulation"</strong> to discover the optimal sourcing strategy.
            </p>
          </div>
        )}

        {results && bestPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Human Recommendation Summary Banner */}
            <div style={{
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '7px',
              border: '1px solid #86efac',
              color: '#166534',
              lineHeight: '1.4'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <strong style={{ color: '#15803d', fontSize: '12px' }}>
                  🎯 Recommended Sourcing Strategy
                </strong>
                <span style={{ fontSize: '9.5px', color: '#166534', background: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, border: '1px solid #86efac' }}>
                  Optimal Decision
                </span>
              </div>
              <div style={{ fontSize: '11.5px' }}>
                {regPct === 100
                  ? `Order 100% from Supplier 1 (Regular) to maximize bulk procurement savings. Under standard shipping, this achieves ${fillRatePct}% service level.`
                  : emgPct === 100
                  ? `Allocate 100% to Supplier 2 (Local Express) to prioritize delivery speed and eliminate stockouts (${fillRatePct}% fill rate).`
                  : `Order ${regPct}% from Supplier 1 (Regular) for bulk savings, and allocate ${emgPct}% to Supplier 2 (Local Express) as safety buffer. This achieves ${fillRatePct}% fill rate while minimizing holding cost and stockout penalties.`}
              </div>
            </div>

            {/* Infeasibility Advisory Banner (if extreme disruption) */}
            {results.is_target_met === false && (
              <div style={{
                padding: '7px 10px',
                background: '#fffbeb',
                borderRadius: '6px',
                borderLeft: '3px solid #f59e0b',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: '1.35'
              }}>
                <strong>⚠️ Notice:</strong> Under the severe delivery delays specified, no allocation reaches the standard 95% service target. Showing the best achievable resilience split ({fillRatePct}% fill rate).
              </div>
            )}

            {/* Blue Hero Result Card (Single-Row 1x4 KPIs to Fit Without Scrolling) */}
            <div style={{ padding: '9px 12px', backgroundColor: '#eff6ff', borderRadius: '7px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1d4ed8', fontWeight: '700' }}>
                  Target Allocation Split
                </span>
                <span style={{ fontSize: '10.5px', color: '#1e40af', fontWeight: 600 }}>
                  {regPct}% Regular / {emgPct}% Express
                </span>
              </div>

              <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 7px 0' }}>
                Optimal Split: {regPct}% Supplier 1 &bull; {emgPct}% Supplier 2
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #dbeafe' }}>
                  <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Expected Cost</span>
                  <p style={{ margin: '2px 0 1px 0', fontWeight: '700', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ${bestPlan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span style={{ fontSize: '9px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>Total operational</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #dbeafe' }}>
                  <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Service Level</span>
                  <p style={{ margin: '2px 0 1px 0', fontWeight: '700', fontSize: '13px', color: bestPlan.expected_fill_rate >= 0.95 ? '#15803d' : '#b45309', whiteSpace: 'nowrap' }}>
                    {(bestPlan.expected_fill_rate * 100).toFixed(2)}%
                  </p>
                  <span style={{ fontSize: '9px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>Demand fulfilled</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #dbeafe' }}>
                  <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Worst 5% Risk</span>
                  <p style={{ margin: '2px 0 1px 0', fontWeight: '700', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ${bestPlan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span style={{ fontSize: '9px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>Crisis exposure</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #dbeafe' }}>
                  <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Efficiency</span>
                  <p style={{ margin: '2px 0 1px 0', fontWeight: '700', fontSize: '12.5px', color: '#16a34a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Rank 1 (Best)
                  </p>
                  <span style={{ fontSize: '9px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>Optimal trade-off</span>
                </div>
              </div>
            </div>

            {/* Amber Simulation Insights (Single-Row 1x4 Metrics to Fit Without Scrolling) */}
            <div style={{ padding: '9px 12px', backgroundColor: '#fffbeb', borderRadius: '7px', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '11.5px', color: '#92400e', fontWeight: '700' }}>
                  Resilience &amp; Disruption Stress-Test
                </h4>
                <span style={{ fontSize: '9.5px', color: '#92400e', backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fde68a', fontWeight: 500 }}>
                  500 Monte Carlo Runs
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', color: '#78350f' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #fef3c7' }}>
                  <span style={{ color: '#92400e', fontSize: '9.5px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Annual Demand</span>
                  <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#78350f', marginTop: '2px', whiteSpace: 'nowrap' }}>
                    {Math.round(bestPlan.average_yearly_demand).toLocaleString()} <span style={{ fontSize: '9.5px', fontWeight: 500 }}>units/yr</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #fef3c7' }}>
                  <span style={{ color: '#92400e', fontSize: '9.5px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Stockout Risk</span>
                  <div style={{ fontWeight: '700', fontSize: '12.5px', color: bestPlan.stockout_prob > 0.05 ? '#b45309' : '#15803d', marginTop: '2px', whiteSpace: 'nowrap' }}>
                    {(bestPlan.stockout_prob * 100).toFixed(1)}% <span style={{ fontSize: '9.5px', fontWeight: 500 }}>prob</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #fef3c7' }}>
                  <span style={{ color: '#92400e', fontSize: '9.5px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Max Delay (S1)</span>
                  <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#78350f', marginTop: '2px', whiteSpace: 'nowrap' }}>
                    {bestPlan.max_regular_delay} <span style={{ fontSize: '9.5px', fontWeight: 500 }}>days</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '5px', border: '1px solid #fef3c7' }}>
                  <span style={{ color: '#92400e', fontSize: '9.5px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Max Delay (S2)</span>
                  <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#78350f', marginTop: '2px', whiteSpace: 'nowrap' }}>
                    {bestPlan.max_emergency_delay} <span style={{ fontSize: '9.5px', fontWeight: 500 }}>days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default SimulationView;
