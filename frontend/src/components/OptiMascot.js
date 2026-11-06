import React, { useState, useEffect } from 'react';

/**
 * Opti the Warehouse Bot - Interactive Mascot & Supply-Chain Assistant
 * Features:
 * - Dynamic facial expressions (normal, happy, thinking, wink)
 * - Gentle hovering & antenna pulse animations
 * - Dual-supplier package balancing (S1 & S2)
 * - Tab-aware proactive insights (Dashboard, Simulation, What-If, Forecast, Inventory)
 * - Interactive tip cycler & minimize/expand toggle
 */
function OptiMascot({ activeTab, simLoading }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expression, setExpression] = useState('normal');
  const [tipIndex, setTipIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  // Reaction when simulation is loading
  useEffect(() => {
    if (simLoading) {
      setExpression('thinking');
      setIsOpen(true);
    } else {
      setExpression('happy');
      const timer = setTimeout(() => setExpression('normal'), 2500);
      return () => clearTimeout(timer);
    }
  }, [simLoading]);

  // Contextual tips tailored to current view
  const tabInsights = {
    dashboard: [
      "Welcome to DualSourceIQ! Overall service level is sitting at a healthy 98.4%.",
      "I'm continuously monitoring lead-time variance across both suppliers.",
      "Check out the Quick Actions above to trigger a 500-run risk simulation anytime!"
    ],
    inventory: [
      "Managing your active inventory! Remember to balance holding costs with stockout risks.",
      "Notice how Supplier 1 (Local) has a fast 2-day lead time for emergency safety buffer.",
      "Click on any SKU to adjust unit costs, mean lead times, or service targets."
    ],
    simulation: simLoading ? [
      "⚡ Simulating 500 Monte Carlo scenarios... crunching 95% CVaR tail risk!"
    ] : [
      "Ready for 500 Monte Carlo runs! Testing stochastic supply disruptions and lead times.",
      "Watch the 95% CVaR metric: it measures your worst-case 5% risk exposure.",
      "Toggle risk aversion to see how the optimal dual-sourcing ratio adapts automatically!"
    ],
    whatif: [
      "Comparing supplier allocations! The 80/20 split shields against overseas delays.",
      "Notice how pure single-sourcing leaves you vulnerable if lead-time variance spikes.",
      "The recommended allocation guarantees your 95% minimum service level target."
    ],
    forecast: [
      "XGBoost machine learning is projecting demand over the next 30 days!",
      "The blue dashed line shows ML predictions, matching closely with green actuals.",
      "Filter by 'Next 30 Days' or 'All History' to inspect seasonal demand patterns."
    ],
    reports: [
      "Audit & compliance ready! Export your simulation and forecast runs to CSV.",
      "All 500 Monte Carlo paths and CVaR calculations can be reviewed in executive briefs."
    ]
  };

  const currentTips = tabInsights[activeTab] || tabInsights.dashboard;
  const activeMessage = currentTips[tipIndex % currentTips.length];

  // Reset tip index when changing tabs
  useEffect(() => {
    setTipIndex(0);
    setExpression('happy');
    const timer = setTimeout(() => setExpression('normal'), 1800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleNextTip = (e) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % currentTips.length);
    triggerHappyReaction();
  };

  const triggerHappyReaction = () => {
    setIsBouncing(true);
    setExpression('happy');
    setTimeout(() => setIsBouncing(false), 600);
    setTimeout(() => setExpression('normal'), 2000);
  };

  const toggleOpen = () => {
    if (!isOpen) {
      triggerHappyReaction();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`opti-assistant-container ${isOpen ? 'open' : 'minimized'}`}>
      {/* Speech Bubble */}
      {isOpen && (
        <div className="opti-speech-bubble" onClick={(e) => e.stopPropagation()}>
          <div className="opti-bubble-header">
            <div className="opti-header-title">
              <span className="opti-status-dot"></span>
              <strong>Opti</strong>
              <span className="opti-role-badge">Supply Bot</span>
            </div>
            <button
              className="opti-close-btn"
              onClick={() => setIsOpen(false)}
              title="Minimize Opti"
            >
              ✕
            </button>
          </div>

          <div className="opti-bubble-body">
            <p className="opti-message-text">{activeMessage}</p>
          </div>

          <div className="opti-bubble-footer">
            <button className="opti-action-btn" onClick={handleNextTip}>
              <span role="img" aria-label="sparkles">💡</span> Next Tip
            </button>
            <button className="opti-action-btn secondary" onClick={triggerHappyReaction}>
              <span role="img" aria-label="wave">👋</span> Hi Opti!
            </button>
          </div>

          {/* Speech arrow */}
          <div className="opti-speech-arrow"></div>
        </div>
      )}

      {/* Opti Mascot Character Avatar */}
      <div
        className={`opti-character-wrapper ${isBouncing ? 'bounce' : ''}`}
        onClick={toggleOpen}
        title={isOpen ? "Click to minimize Opti" : "Click Opti for smart insights!"}
      >
        <svg
          width="68"
          height="74"
          viewBox="0 0 68 74"
          fill="none"
          className="opti-svg"
        >
          <defs>
            {/* Body Gradient */}
            <linearGradient id="optiBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Cyan Accent */}
            <linearGradient id="optiCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* S1 Box Gradient (Local Fast) */}
            <linearGradient id="boxS1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* S2 Box Gradient (Global Cost) */}
            <linearGradient id="boxS2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id="optiShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
            
            {/* Thruster Glow */}
            <filter id="thrusterGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Thruster Energy Ring (Bottom) */}
          <ellipse cx="34" cy="67" rx="13" ry="3.5" fill="#38bdf8" opacity="0.65" filter="url(#thrusterGlow)" className="opti-thruster-pulse" />
          <ellipse cx="34" cy="67" rx="7" ry="1.8" fill="#ffffff" opacity="0.8" />

          {/* Main Floating Robot Body Group */}
          <g filter="url(#optiShadow)">
            {/* Antenna */}
            <line x1="34" y1="17" x2="34" y2="7" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Antenna Bulb */}
            <circle cx="34" cy="6" r="4" fill="url(#optiCyanGrad)" className="opti-antenna-beacon" />
            <circle cx="34" cy="6" r="1.8" fill="#ffffff" />

            {/* Head/Chassis Base */}
            <rect x="13" y="16" width="42" height="38" rx="19" fill="url(#optiBodyGrad)" stroke="#94a3b8" strokeWidth="1.2" />

            {/* Top Visor Brow / Trim */}
            <path d="M 17 25 Q 34 21 51 25" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

            {/* Dark Digital Visor Screen */}
            <rect x="18" y="24" width="32" height="19" rx="8" fill="#0f172a" />
            {/* Visor Glass Reflection */}
            <path d="M 21 26 L 31 26 L 25 31 L 21 31 Z" fill="#ffffff" opacity="0.15" />

            {/* --- Dynamic Eyes --- */}
            {expression === 'normal' && (
              <g className="opti-eyes">
                {/* Left Eye */}
                <ellipse cx="27" cy="33.5" rx="3.6" ry="4.2" fill="#38bdf8" />
                <circle cx="28.2" cy="32" r="1.4" fill="#ffffff" />
                {/* Right Eye */}
                <ellipse cx="41" cy="33.5" rx="3.6" ry="4.2" fill="#38bdf8" />
                <circle cx="42.2" cy="32" r="1.4" fill="#ffffff" />
              </g>
            )}

            {expression === 'happy' && (
              <g className="opti-eyes-happy">
                {/* Happy curved eyes ^ ^ */}
                <path d="M 23.5 35 Q 27 30 30.5 35" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M 37.5 35 Q 41 30 44.5 35" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                {/* Cute Cheeks */}
                <circle cx="23" cy="38" r="2" fill="#f43f5e" opacity="0.45" />
                <circle cx="45" cy="38" r="2" fill="#f43f5e" opacity="0.45" />
              </g>
            )}

            {expression === 'thinking' && (
              <g className="opti-eyes-thinking">
                {/* Concentrating / Looking sideways */}
                <ellipse cx="28" cy="32" rx="3.5" ry="3.5" fill="#38bdf8" />
                <circle cx="29.2" cy="31" r="1.3" fill="#ffffff" />
                <ellipse cx="42" cy="32" rx="4" ry="4" fill="#38bdf8" />
                <circle cx="43.2" cy="31" r="1.5" fill="#ffffff" />
                {/* Thinking eyebrow */}
                <line x1="38" y1="27" x2="45" y2="28" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}

            {/* Cute Smile */}
            <path d="M 31 39 Q 34 41 37 39" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" />

            {/* Bottom Thruster Base Nozzle */}
            <path d="M 29 54 L 39 54 L 37 59 L 31 59 Z" fill="#64748b" />

            {/* --- Left Floating S1 Package (Local Fast Supplier) --- */}
            <g className="opti-box-s1">
              <rect x="2" y="32" width="13" height="13" rx="2.5" fill="url(#boxS1Grad)" stroke="#38bdf8" strokeWidth="0.8" />
              <text x="8.5" y="41" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                S1
              </text>
            </g>

            {/* --- Right Floating S2 Package (Global Low-Cost Supplier) --- */}
            <g className="opti-box-s2">
              <rect x="53" y="32" width="13" height="13" rx="2.5" fill="url(#boxS2Grad)" stroke="#c084fc" strokeWidth="0.8" />
              <text x="59.5" y="41" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                S2
              </text>
            </g>
          </g>
        </svg>

        {/* Small Notification Indicator if collapsed */}
        {!isOpen && (
          <span className="opti-collapsed-badge" title="Click for supply insights!">
            💡
          </span>
        )}
      </div>
    </div>
  );
}

export default OptiMascot;
