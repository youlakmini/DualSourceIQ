import React, { useState } from 'react';

function WhatIfView({
  params,
  handleSimChange,
  runSimulation,
  loading,
  error,
  results,
  inventory,
  forecastBanner,
  onDismissBanner
}) {
  const [activePreset, setActivePreset] = useState(null);

  // Wrapper to allow users to tweak any parameter freely while updating preset state
  const onFieldChange = (e) => {
    setActivePreset(null); // Indicates user has customized parameters
    handleSimChange(e);
  };

  const applyPreset = (presetKey, presetValues) => {
    setActivePreset(presetKey);
    Object.keys(presetValues).forEach((fieldName) => {
      handleSimChange({ target: { name: fieldName, value: presetValues[fieldName] } });
    });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.25fr', gap: '14px', height: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Left Column: What-If Parameters Card */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '14px 18px' }}>
        <div style={{ marginBottom: '8px', flexShrink: 0 }}>
          <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>
            What-If Scenario Simulation
          </h3>
          <p className="card-subtitle" style={{ margin: '2px 0 0 0', fontSize: '11.5px' }}>
            Simulate dual-sourcing resilience under demand surges and shipping delays
          </p>
        </div>

        {/* Minimalist Floating Scenario Chips (No Heavy Outer Box) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginRight: '2px' }}>Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('normal', {
              demand_modifier_pct: 0,
              regular_lead_time_mean: 7,
              emergency_lead_time_mean: 2,
              risk_aversion: 0.5
            })}
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: activePreset === 'normal' ? '#2563eb' : '#cbd5e1',
              background: activePreset === 'normal' ? '#2563eb' : '#ffffff',
              color: activePreset === 'normal' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              fontWeight: activePreset === 'normal' ? 700 : 500,
              boxShadow: activePreset === 'normal' ? '0 1px 4px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
            title="Standard operational baseline (0% surge, 7d lead time, λ=0.5)"
          >
            📦 Normal
          </button>
          <button
            type="button"
            onClick={() => applyPreset('demand_surge', {
              demand_modifier_pct: 25,
              regular_lead_time_mean: 7,
              emergency_lead_time_mean: 2
            })}
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: activePreset === 'demand_surge' ? '#ea580c' : '#fed7aa',
              background: activePreset === 'demand_surge' ? '#ea580c' : '#fff7ed',
              color: activePreset === 'demand_surge' ? '#ffffff' : '#c2410c',
              cursor: 'pointer',
              fontWeight: activePreset === 'demand_surge' ? 700 : 500,
              boxShadow: activePreset === 'demand_surge' ? '0 1px 4px rgba(234, 88, 12, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
            title="Sudden +25% market demand spike"
          >
            🔥 +25% Demand
          </button>
          <button
            type="button"
            onClick={() => applyPreset('delay', {
              demand_modifier_pct: 0,
              regular_lead_time_mean: 12,
              emergency_lead_time_mean: 2
            })}
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: activePreset === 'delay' ? '#dc2626' : '#fecaca',
              background: activePreset === 'delay' ? '#dc2626' : '#fef2f2',
              color: activePreset === 'delay' ? '#ffffff' : '#b91c1c',
              cursor: 'pointer',
              fontWeight: activePreset === 'delay' ? 700 : 500,
              boxShadow: activePreset === 'delay' ? '0 1px 4px rgba(220, 38, 38, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
            title="Supplier delayed by 5 days (12d total)"
          >
            🚢 +5d Delay
          </button>
          <button
            type="button"
            onClick={() => applyPreset('severe', {
              demand_modifier_pct: 30,
              regular_lead_time_mean: 14,
              emergency_lead_time_mean: 3,
              risk_aversion: 0.8
            })}
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: activePreset === 'severe' ? '#be185d' : '#fbcfe8',
              background: activePreset === 'severe' ? '#be185d' : '#fdf2f8',
              color: activePreset === 'severe' ? '#ffffff' : '#9d174d',
              cursor: 'pointer',
              fontWeight: activePreset === 'severe' ? 700 : 500,
              boxShadow: activePreset === 'severe' ? '0 1px 4px rgba(190, 24, 93, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
            title="Severe crisis: +30% demand, 14 days delay, λ=0.8"
          >
            ⚡ Severe Crisis
          </button>
          {activePreset === null && (params.demand_modifier_pct !== 0 || params.regular_lead_time_mean !== 7) && (
            <span style={{ fontSize: '10.5px', color: '#64748b', fontStyle: 'italic', marginLeft: '3px' }}>
              • Custom Inputs
            </span>
          )}
        </div>

        {/* Integration Banner from Demand Forecast */}
        {forecastBanner && (
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #93c5fd',
            borderRadius: '6px',
            padding: '8px 11px',
            marginBottom: '10px',
            fontSize: '11.5px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            lineHeight: 1.4,
            flexShrink: 0
          }}>
            <div>
              <span style={{ fontWeight: 700, color: '#1d4ed8' }}>⚡ Loaded from Demand Forecast:</span>{' '}
              Applied <strong>{forecastBanner.trendPct >= 0 ? `+${forecastBanner.trendPct}%` : `${forecastBanner.trendPct}%`}</strong> demand surge to{' '}
              <strong>{forecastBanner.productName || forecastBanner.sku}</strong>. Review your supplier parameters below, then click &ldquo;Compare Sourcing Strategies&rdquo;.
            </div>
            {onDismissBanner && (
              <button 
                onClick={onDismissBanner} 
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', padding: '0 4px', fontWeight: 'bold' }}
                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Product & Demand Surge Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px', marginBottom: '10px', flexShrink: 0 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '11.5px', marginBottom: '3px' }}>Target Product</label>
            <select className="form-select" name="sku" value={params.sku} onChange={handleSimChange} style={{ padding: '6px 8px', fontSize: '12px' }}>
              {inventory.map(item => <option key={item.sku} value={item.sku}>{item.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '11.5px', marginBottom: '3px' }}>
              Demand Surge / Drop (%)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="number" 
                step="1" 
                min="-99" 
                max="500" 
                className="form-input" 
                name="demand_modifier_pct" 
                value={params.demand_modifier_pct} 
                onChange={onFieldChange} 
                placeholder="0" 
                style={{ padding: '6px 24px 6px 8px', fontSize: '12px', width: '100%' }}
              />
              <span style={{ position: 'absolute', right: '9px', fontSize: '11.5px', color: '#94a3b8', pointerEvents: 'none' }}>
                %
              </span>
            </div>
          </div>
        </div>

        {/* Hybrid Risk Preference: 3 Preset Buttons + Number Option (0 - 1) */}
        <div style={{ marginBottom: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '11.5px' }}>
              Risk Preference (0 – 1)
            </label>
            <span style={{ fontSize: '10.5px', color: params.risk_aversion <= 0.3 ? '#2563eb' : params.risk_aversion >= 0.7 ? '#15803d' : '#b45309', fontWeight: 600 }}>
              {params.risk_aversion <= 0.3 ? '💰 Cost Saver' : params.risk_aversion >= 0.7 ? '🛡️ Safe Buffer' : '⚖️ Balanced'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 3 Quick Choice Preset Pills */}
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  setActivePreset(null);
                  handleSimChange({ target: { name: 'risk_aversion', value: 0.2 } });
                }}
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
                onClick={() => {
                  setActivePreset(null);
                  handleSimChange({ target: { name: 'risk_aversion', value: 0.5 } });
                }}
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
                title="Balanced cost & protection (0.5)"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePreset(null);
                  handleSimChange({ target: { name: 'risk_aversion', value: 0.8 } });
                }}
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

            {/* Direct Number Input (0 - 1) */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="number" 
                step="0.05" 
                min="0" 
                max="1" 
                className="form-input" 
                name="risk_aversion" 
                value={params.risk_aversion} 
                onChange={onFieldChange} 
                style={{ width: '68px', padding: '5px 6px', fontSize: '12px', textAlign: 'center', fontWeight: 600 }}
                title="Custom risk aversion value between 0.0 and 1.0"
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
              />
            </div>
          </div>
        </div>

        {/* Side-by-Side Supplier Grid (Spacious, Eliminates Vertical Box Stacking) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px', flexShrink: 0 }}>
          {/* Supplier 1: Primary Overseas / Bulk */}
          <div style={{ padding: '9px 11px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>Supplier 1 (Primary)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Unit Purchase Cost</span>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '7px', top: '5px', fontSize: '11px', color: '#94a3b8' }}>$</span>
                  <input type="number" min="0" className="form-input" name="regular_unit_cost" value={params.regular_unit_cost} onChange={onFieldChange} style={{ padding: '4px 6px 4px 17px', fontSize: '12px' }} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Lead Time</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" className="form-input" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={onFieldChange} style={{ padding: '4px 28px 4px 7px', fontSize: '12px' }} />
                  <span style={{ position: 'absolute', right: '7px', top: '5px', fontSize: '10.5px', color: '#94a3b8' }}>days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier 2: Fast Local / Backup */}
          <div style={{ padding: '9px 11px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>Supplier 2 (Express)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Unit Purchase Cost</span>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '7px', top: '5px', fontSize: '11px', color: '#94a3b8' }}>$</span>
                  <input type="number" min="0" className="form-input" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={onFieldChange} style={{ padding: '4px 6px 4px 17px', fontSize: '12px' }} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Lead Time</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" className="form-input" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={onFieldChange} style={{ padding: '4px 28px 4px 7px', fontSize: '12px' }} />
                  <span style={{ position: 'absolute', right: '7px', top: '5px', fontSize: '10.5px', color: '#94a3b8' }}>days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '4px', flexShrink: 0 }}>
          <button 
            className="btn-primary" 
            onClick={runSimulation} 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              backgroundColor: '#2563eb',
              fontWeight: 600,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{loading ? 'Simulating Strategy Outcomes...' : '⚡ Compare Sourcing Strategies'}</span>
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '5px', margin: '5px 0 0 0' }}>Error: {error}</p>}
        </div>
      </div>

      {/* Right Column: Compare Sourcing Strategies Table Card */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '14px 18px' }}>
        <div style={{ marginBottom: '8px', flexShrink: 0 }}>
          <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>
            Sourcing Strategy Comparison
          </h3>
          <p className="card-subtitle" style={{ margin: '2px 0 0 0', fontSize: '11.5px' }}>
            Compare performance across single-sourcing baselines and risk-optimized dual-sourcing splits
          </p>
        </div>

        {!results && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚖️</div>
            <strong>Ready to Compare Sourcing Options</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', maxWidth: '320px' }}>
              Select a quick preset on the left or customize lead times, then click &ldquo;Compare Sourcing Strategies&rdquo;.
            </p>
          </div>
        )}

        {results && results.all_plans && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Executive Recommendation Banner / Advisory Alert */}
            {results.best_plan && (
              results.is_target_met === false ? (
                <div style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  color: '#92400e',
                  flexShrink: 0
                }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>⚠️ Service Target Infeasible Under Extreme Disruption:</span>
                    <span>Best Mitigation: {Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Fast Backup</span>
                  </div>
                  <div>
                    With a {params.regular_lead_time_mean}-day primary lead time and {params.demand_modifier_pct > 0 ? `+${params.demand_modifier_pct}%` : ''} demand surge, no allocation reaches the {results.target_service_level_pct || 95}% target. 
                    The best dual-sourcing mitigation recovers customer fill rate to <strong>{(results.best_plan.expected_fill_rate * 100).toFixed(1)}%</strong>, whereas pure regular supplier collapses to <strong>{(results.all_plans.find(p => p.primary_ratio === 1.0)?.expected_fill_rate * 100).toFixed(1)}%</strong>. Consider raising inventory reorder points to bridge this severe supply gap.
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  color: '#166534',
                  flexShrink: 0
                }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🏆 Optimal Decision:</span>
                    <span>{Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Fast Backup</span>
                  </div>
                  <div>
                    Protects customer service at <strong>{(results.best_plan.expected_fill_rate * 100).toFixed(1)}% fill rate</strong> with total expected cost of <strong>${results.best_plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>, effectively cushioning disruptions while minimizing excess holding costs.
                  </div>
                </div>
              )
            )}

            {/* Sourcing Strategy Comparison Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table className="modern-table" style={{ margin: 0, fontSize: '11px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 5, backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '6px 8px' }}>Supplier Split</th>
                    <th style={{ padding: '6px 8px' }}>Expected Total Cost</th>
                    <th style={{ padding: '6px 8px' }}>Service Level (Fill Rate)</th>
                    <th style={{ padding: '6px 8px' }} title="Worst-case 5% tail risk scenario">Worst 5% Risk (CVaR)</th>
                    <th style={{ padding: '6px 8px' }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {results.all_plans
                    .filter(p => p.primary_ratio === 1.0 || p.primary_ratio === 0.0 || p.primary_ratio === 0.5 || p.primary_ratio === results.best_plan.primary_ratio)
                    .map((plan, idx) => {
                      const isBest = plan.primary_ratio === results.best_plan.primary_ratio;
                      const name = plan.primary_ratio === 1.0 
                        ? '100% Regular (Single Source)' 
                        : plan.primary_ratio === 0.0 
                        ? '100% Fast Backup (Premium)' 
                        : plan.primary_ratio === 0.5 
                        ? 'Balanced Split (50% / 50%)' 
                        : `Risk-Aware Split (${Math.round(plan.primary_ratio * 100)}% / ${Math.round((1 - plan.primary_ratio) * 100)}%)`;
                      
                      const isFailingService = plan.expected_fill_rate < 0.95;

                      return (
                        <tr 
                          key={idx} 
                          style={{ 
                            backgroundColor: isBest ? '#eff6ff' : 'transparent', 
                            fontWeight: isBest ? 600 : 'normal',
                            borderLeft: isBest ? '3px solid #2563eb' : '3px solid transparent'
                          }}
                        >
                          <td style={{ padding: '6px 8px', color: isBest ? '#1d4ed8' : '#0f172a' }}>
                            <strong>{name}</strong>
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            ${plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '6px 8px', color: isFailingService ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                            {(plan.expected_fill_rate * 100).toFixed(1)}%
                            {isFailingService && (
                              <span style={{ display: 'block', fontSize: '9.5px', color: '#ef4444', fontWeight: 500 }}>
                                ⚠️ Below 95% Target
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '6px 8px', color: '#475569' }}>
                            ${plan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            {isBest ? (
                              <span 
                                className="badge-pill" 
                                style={{ 
                                  fontSize: '10.5px',
                                  backgroundColor: results.is_target_met === false ? '#fef3c7' : '#dcfce7',
                                  color: results.is_target_met === false ? '#92400e' : '#166534',
                                  border: `1px solid ${results.is_target_met === false ? '#fde68a' : '#86efac'}`
                                }}
                              >
                                {results.is_target_met === false ? '⭐ Best Mitigation' : '⭐ Recommended'}
                              </span>
                            ) : plan.primary_ratio === 1.0 && isFailingService ? (
                              <span style={{ color: '#b91c1c', fontSize: '10.5px', fontWeight: 600 }}>
                                High Stockout Risk
                              </span>
                            ) : plan.primary_ratio === 0.0 ? (
                              <span style={{ color: '#b45309', fontSize: '10.5px', fontWeight: 500 }}>
                                High Procurement Cost
                              </span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '10.5px' }}>
                                Alternative
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b', flexShrink: 0, paddingRight: '70px' }}>
              💡 <em>Single-sourcing saves on purchase price during calm periods, but causes severe stockouts when delays occur. The recommended dual-sourcing split cushions disruptions with minimal cost increase.</em>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatIfView;
