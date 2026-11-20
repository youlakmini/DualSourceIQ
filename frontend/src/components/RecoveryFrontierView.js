import React, { useState, useEffect, useMemo } from 'react';

function RecoveryFrontierView({ inventory }) {
  const [selectedSku, setSelectedSku] = useState('');
  const [minServiceLevel, setMinServiceLevel] = useState(0.95);
  const [activeSeverity, setActiveSeverity] = useState('severe'); // 'normal' | 'moderate' | 'severe'
  const [frontierData, setFrontierData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Set default SKU on inventory load
  useEffect(() => {
    if (inventory && inventory.length > 0 && !selectedSku) {
      setSelectedSku(inventory[0].sku);
    }
  }, [inventory, selectedSku]);

  // Fetch / Compute Recovery Frontier
  const fetchRecoveryFrontier = async (skuToFetch = selectedSku) => {
    if (!skuToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/recovery-frontier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: skuToFetch,
          regular_unit_cost: 8.0,
          emergency_unit_cost: 18.0,
          regular_lead_time_mean: 7.0,
          regular_lead_time_std: 2.0,
          emergency_lead_time_mean: 2.0,
          emergency_lead_time_std: 0.0,
          min_service_level: parseFloat(minServiceLevel),
          baseline_emergency_ratio: 0.10,
          num_simulations: 50
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to compute recovery frontier');
      }

      const data = await response.json();
      setFrontierData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run on first load once SKU is available
  useEffect(() => {
    if (selectedSku) {
      fetchRecoveryFrontier(selectedSku);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSku, minServiceLevel]);

  // Active scenario data
  const currentScenario = useMemo(() => {
    if (!frontierData || !frontierData.scenarios) return null;
    return frontierData.scenarios[activeSeverity] || null;
  }, [frontierData, activeSeverity]);

  const allPoints = useMemo(() => {
    return currentScenario?.all_evaluations || [];
  }, [currentScenario]);

  const paretoPoints = useMemo(() => {
    return currentScenario?.pareto_frontier || [];
  }, [currentScenario]);

  const recoverySummary = currentScenario ? currentScenario.recovery_summary : null;

  // Chart Dimensions & Scaling
  const chartWidth = 560;
  const chartHeight = 290;
  const padding = { top: 25, right: 30, bottom: 42, left: 65 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Coordinate mappers
  const minCost = useMemo(() => {
    if (allPoints.length === 0) return 0;
    const minVal = Math.min(...allPoints.map(p => p.expected_cost));
    return Math.floor(minVal * 0.95);
  }, [allPoints]);

  const maxCost = useMemo(() => {
    if (allPoints.length === 0) return 10000;
    const maxVal = Math.max(...allPoints.map(p => p.expected_cost));
    return Math.ceil(maxVal * 1.05);
  }, [allPoints]);

  const minFillRate = 0.50; // 50%
  const maxFillRate = 1.00; // 100%

  const getX = (fillRate) => {
    const ratio = Math.max(0, Math.min(1, (fillRate - minFillRate) / (maxFillRate - minFillRate)));
    return padding.left + ratio * graphWidth;
  };

  const getY = (cost) => {
    const range = maxCost - minCost || 1;
    const ratio = Math.max(0, Math.min(1, (cost - minCost) / range));
    return padding.top + (1 - ratio) * graphHeight;
  };

  // Sort pareto points by fill rate for smooth frontier curve
  const sortedPareto = useMemo(() => {
    return [...paretoPoints].sort((a, b) => a.expected_fill_rate - b.expected_fill_rate);
  }, [paretoPoints]);

  const paretoPathStr = sortedPareto.map((p, i) => {
    return `${i === 0 ? 'M' : 'L'} ${getX(p.expected_fill_rate)} ${getY(p.expected_cost)}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Top Filter Bar */}
      <div className="dashboard-card" style={{ padding: '8px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Target Product:</label>
              <select
                className="form-select"
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                style={{ width: '220px', padding: '4px 8px' }}
              >
                {inventory.map(item => (
                  <option key={item.sku} value={item.sku}>{item.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Service Target (F<sub>min</sub>):</label>
              <select
                className="form-select"
                value={minServiceLevel}
                onChange={(e) => setMinServiceLevel(parseFloat(e.target.value))}
                style={{ width: '110px', padding: '4px 8px' }}
              >
                <option value="0.90">90.0%</option>
                <option value="0.95">95.0%</option>
                <option value="0.98">98.0%</option>
                <option value="0.99">99.0%</option>
              </select>
            </div>

            {/* Delay Severity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveSeverity('normal')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeSeverity === 'normal' ? '#10b981' : 'transparent',
                  color: activeSeverity === 'normal' ? '#ffffff' : '#475569',
                  transition: 'all 0.15s'
                }}
              >
                🟢 Normal (+0d)
              </button>
              <button
                type="button"
                onClick={() => setActiveSeverity('moderate')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeSeverity === 'moderate' ? '#f59e0b' : 'transparent',
                  color: activeSeverity === 'moderate' ? '#ffffff' : '#475569',
                  transition: 'all 0.15s'
                }}
              >
                🟡 Moderate (+3d)
              </button>
              <button
                type="button"
                onClick={() => setActiveSeverity('severe')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeSeverity === 'severe' ? '#ef4444' : 'transparent',
                  color: activeSeverity === 'severe' ? '#ffffff' : '#475569',
                  transition: 'all 0.15s'
                }}
              >
                🔴 Severe (+7d)
              </button>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => fetchRecoveryFrontier(selectedSku)}
            disabled={loading}
            style={{
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
            }}
          >
            <span>{loading ? 'Crunching Frontiers...' : '⚡ Recompute RSRF'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '12px', flex: 1, minHeight: 0 }}>
        {/* Left Column: Interactive Frontier Chart Card */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexShrink: 0 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>
                Risk–Service Recovery Frontier (RSRF)
              </h3>
              <p className="card-subtitle" style={{ margin: '2px 0 0 0', fontSize: '11.5px' }}>
                Multi-objective non-dominated trade-offs under <strong>{currentScenario?.metadata?.name || 'Selected Delay'}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>
                Pareto Frontier
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }}></span>
                Dominated Plan
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Recovery Plan (x*)
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚡</div>
                <strong>Evaluating candidate allocations across delay scenarios...</strong>
              </div>
            ) : error ? (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                <strong>Error:</strong> {error}
              </div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Grid Lines */}
                {[0.6, 0.7, 0.8, 0.9, 1.0].map((fr, idx) => (
                  <g key={`x-grid-${idx}`}>
                    <line
                      x1={getX(fr)}
                      y1={padding.top}
                      x2={getX(fr)}
                      y2={chartHeight - padding.bottom}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={getX(fr)}
                      y={chartHeight - padding.bottom + 15}
                      fill="#64748b"
                      fontSize="9.5"
                      textAnchor="middle"
                    >
                      {Math.round(fr * 100)}%
                    </text>
                  </g>
                ))}

                {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                  const costVal = minCost + ratio * (maxCost - minCost);
                  return (
                    <g key={`y-grid-${idx}`}>
                      <line
                        x1={padding.left}
                        y1={getY(costVal)}
                        x2={chartWidth - padding.right}
                        y2={getY(costVal)}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={getY(costVal) + 3}
                        fill="#64748b"
                        fontSize="9.5"
                        textAnchor="end"
                      >
                        ${Math.round(costVal).toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Target Service Level Threshold Line (F_min) */}
                <line
                  x1={getX(minServiceLevel)}
                  y1={padding.top}
                  x2={getX(minServiceLevel)}
                  y2={chartHeight - padding.bottom}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={getX(minServiceLevel) - 4}
                  y={padding.top + 10}
                  fill="#ef4444"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  Target {Math.round(minServiceLevel * 100)}%
                </text>

                {/* Pareto Frontier Line Curve */}
                {paretoPathStr && (
                  <path
                    d={paretoPathStr}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}

                {/* Render Dominated Candidate Points */}
                {allPoints.filter(p => !p.is_pareto).map((p, idx) => (
                  <circle
                    key={`dom-${idx}`}
                    cx={getX(p.expected_fill_rate)}
                    cy={getY(p.expected_cost)}
                    r="4"
                    fill="#94a3b8"
                    opacity="0.5"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* Render Pareto-Optimal Frontier Points */}
                {paretoPoints.map((p, idx) => {
                  const isRecovery = recoverySummary?.recovery_plan?.emergency_ratio === p.emergency_ratio;
                  const isBaseline = recoverySummary?.baseline?.emergency_ratio === p.emergency_ratio;

                  return (
                    <g key={`pareto-${idx}`}>
                      <circle
                        cx={getX(p.expected_fill_rate)}
                        cy={getY(p.expected_cost)}
                        r={isRecovery ? "7.5" : isBaseline ? "6.5" : "5"}
                        fill={isRecovery ? "#10b981" : isBaseline ? "#f59e0b" : "#2563eb"}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {isRecovery && (
                        <circle
                          cx={getX(p.expected_fill_rate)}
                          cy={getY(p.expected_cost)}
                          r="11"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text
                  x={padding.left + graphWidth / 2}
                  y={chartHeight - 8}
                  fill="#475569"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  Customer Service Level (Fill Rate %) →
                </text>
                <text
                  transform={`rotate(-90)`}
                  x={-(padding.top + graphHeight / 2)}
                  y={16}
                  fill="#475569"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  Expected Cost ($) ↑
                </text>
              </svg>
            )}

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(15, 23, 42, 0.95)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '3px' }}>{hoveredPoint.label}</div>
                <div>Fill Rate: <strong>{hoveredPoint.fill_rate_pct}%</strong></div>
                <div>Expected Cost: <strong>${hoveredPoint.expected_cost.toLocaleString()}</strong></div>
                <div>Cost CVaR (95%): <strong>${hoveredPoint.cvar.toLocaleString()}</strong></div>
                <div>Status: <span style={{ color: hoveredPoint.is_pareto ? '#4ade80' : '#cbd5e1' }}>{hoveredPoint.is_pareto ? 'Pareto Optimal' : 'Dominated'}</span></div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
            <strong>Contribution D Note:</strong> Points strictly on the solid blue line represent non-dominated allocations. Gray points are mathematically dominated and discarded.
          </div>
        </div>

        {/* Right Column: Resilience & Constrained Recovery Decision Panel */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 12px', overflow: 'hidden' }}>
          <div style={{ flexShrink: 0, marginBottom: '5px' }}>
            <h3 className="card-title" style={{ margin: 0, fontSize: '14px' }}>
              Constrained Recovery Decision
            </h3>
            <p className="card-subtitle" style={{ margin: '1px 0 0 0', fontSize: '10.5px' }}>
              Optimal allocation to restore service under <strong>{currentScenario?.metadata?.name}</strong>
            </p>
          </div>

          {/* 4 Summary Metric Cards (Horizontal 4-Column Strip to Save Space) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginBottom: '6px', flexShrink: 0 }}>
            <div style={{ padding: '5px 6px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Baseline Service</span>
              <h3 style={{ margin: '1px 0 0 0', fontSize: '14px', fontWeight: 700, color: (recoverySummary?.baseline_fill_rate_pct || 100) < minServiceLevel * 100 ? '#ef4444' : '#10b981' }}>
                {recoverySummary ? `${recoverySummary.baseline_fill_rate_pct}%` : '--'}
              </h3>
              <span style={{ fontSize: '8.5px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>At 90/10 Baseline</span>
            </div>

            <div style={{ padding: '5px 6px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Restored Service</span>
              <h3 style={{ margin: '1px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
                {recoverySummary ? `${recoverySummary.restored_fill_rate_pct}%` : '--'}
              </h3>
              <span style={{ fontSize: '8.5px', color: '#059669', fontWeight: 500, display: 'block', whiteSpace: 'nowrap' }}>Target: &ge; {Math.round(minServiceLevel * 100)}%</span>
            </div>

            <div style={{ padding: '5px 6px', background: '#eff6ff', borderRadius: '5px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '8.5px', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Recovery (&Delta;C)</span>
              <h3 style={{ margin: '1px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                {recoverySummary?.recovery_cost_premium !== null && recoverySummary?.recovery_cost_premium !== undefined
                  ? recoverySummary.recovery_cost_premium === 0
                    ? '$0.00'
                    : `+$${recoverySummary.recovery_cost_premium.toLocaleString()}`
                  : 'N/A'}
              </h3>
              <span style={{ fontSize: '8.5px', color: '#1e40af', display: 'block', whiteSpace: 'nowrap' }}>Emergency spend</span>
            </div>

            <div style={{ padding: '5px 6px', background: '#f8fafc', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Penalty Avoided</span>
              <h3 style={{ margin: '1px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                {recoverySummary?.penalty_avoided
                  ? `-$${Math.round(recoverySummary.penalty_avoided).toLocaleString()}`
                  : '$0.00'}
              </h3>
              <span style={{ fontSize: '8.5px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>Shortage avoided</span>
            </div>
          </div>

          {/* Compact Decision Recommendation Callout */}
          <div style={{
            background: recoverySummary?.is_feasible ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#fef2f2',
            border: `1px solid ${recoverySummary?.is_feasible ? '#86efac' : '#fca5a5'}`,
            borderRadius: '5px',
            padding: '5px 8px',
            marginBottom: '6px',
            fontSize: '10.5px',
            lineHeight: 1.35,
            color: recoverySummary?.is_feasible ? '#166534' : '#991b1b',
            flexShrink: 0
          }}>
            <div style={{ fontWeight: 700, marginBottom: '1px' }}>
              {recoverySummary?.is_feasible ? '✅ Recovery Recommendation' : '⚠️ Infeasibility Alert'}
            </div>
            {recoverySummary?.recommendation_text || 'Evaluating recovery plans...'}
          </div>

          {/* 3-Tier Delay Severity Comparison Table (Fixed Fit, No Scrolling Needed) */}
          <div style={{ flexShrink: 0, marginBottom: '2px' }}>
            <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
              Cross-Severity Resilience Table
            </h4>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '5px', overflow: 'hidden', flexShrink: 0 }}>
            <table className="modern-table" style={{ margin: 0, fontSize: '10.5px', width: '100%' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '3.5px 6px', fontSize: '10px' }}>Delay Scenario</th>
                  <th style={{ padding: '3.5px 6px', fontSize: '10px' }}>Baseline</th>
                  <th style={{ padding: '3.5px 6px', fontSize: '10px' }}>Recovery Plan</th>
                  <th style={{ padding: '3.5px 6px', fontSize: '10px' }}>Restored</th>
                  <th style={{ padding: '3.5px 6px', fontSize: '10px' }}>Premium (&Delta;C)</th>
                </tr>
              </thead>
              <tbody>
                {frontierData && Object.keys(frontierData.scenarios).map((scKey) => {
                  const sc = frontierData.scenarios[scKey];
                  const rec = sc.recovery_summary;
                  const isCurrent = scKey === activeSeverity;

                  return (
                    <tr
                      key={scKey}
                      onClick={() => setActiveSeverity(scKey)}
                      style={{
                        background: isCurrent ? '#eff6ff' : 'transparent',
                        fontWeight: isCurrent ? 600 : 'normal',
                        cursor: 'pointer',
                        borderLeft: isCurrent ? '3px solid #2563eb' : '3px solid transparent',
                        transition: 'all 0.15s'
                      }}
                      title="Click to view this scenario on chart"
                    >
                      <td style={{ padding: '3.5px 6px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: scKey === 'normal' ? '#10b981' : scKey === 'moderate' ? '#f59e0b' : '#ef4444', marginRight: '5px' }}></span>
                        {sc.metadata.name}
                      </td>
                      <td style={{ padding: '3.5px 6px', color: rec.baseline_fill_rate_pct < minServiceLevel * 100 ? '#ef4444' : '#10b981' }}>
                        {rec.baseline_fill_rate_pct}%
                      </td>
                      <td style={{ padding: '3.5px 6px' }}>
                        <strong>{rec.recovery_plan.label}</strong>
                      </td>
                      <td style={{ padding: '3.5px 6px', color: '#059669', fontWeight: 600 }}>
                        {rec.restored_fill_rate_pct}%
                      </td>
                      <td style={{ padding: '3.5px 6px', fontWeight: 700, color: rec.recovery_cost_premium > 0 ? '#2563eb' : '#64748b' }}>
                        {rec.recovery_cost_premium !== null && rec.recovery_cost_premium !== undefined
                          ? rec.recovery_cost_premium === 0
                            ? '$0.00'
                            : `+$${rec.recovery_cost_premium.toLocaleString()}`
                          : 'Infeasible'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '4px', fontSize: '9px', color: '#64748b', flexShrink: 0 }}>
            💡 <em>Click any row above to inspect its Pareto curve on the left.</em>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecoveryFrontierView;
