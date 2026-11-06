import React from 'react';

export const DualSourceIQLogo = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    style={{ display: 'block', flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="navBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="navTopFace" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="navLeftFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="navRightFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#navBgGrad)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.5" />
    <path d="M 32 14 L 49 23 L 32 32 L 15 23 Z" fill="url(#navTopFace)" opacity="0.95" />
    <path d="M 15 23 L 32 32 L 32 50 L 15 41 Z" fill="url(#navLeftFace)" />
    <path d="M 32 32 L 49 23 L 49 41 L 32 50 Z" fill="url(#navRightFace)" />
    <path d="M 32 14 L 49 23 L 32 32 L 15 23 Z" stroke="#7dd3fc" strokeWidth="0.8" strokeLinejoin="round" opacity="0.7" />
    <line x1="32" y1="32" x2="32" y2="50" stroke="#93c5fd" strokeWidth="1.2" opacity="0.6" />
    <path d="M 20 33 L 26 36 L 32 32" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 44 33 L 38 36 L 32 32" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="33" r="2.8" fill="#38bdf8" />
    <circle cx="20" cy="33" r="1.3" fill="#ffffff" />
    <circle cx="44" cy="33" r="2.8" fill="#818cf8" />
    <circle cx="44" cy="33" r="1.3" fill="#ffffff" />
    <circle cx="32" cy="32" r="3.6" fill="#ffffff" />
    <circle cx="32" cy="32" r="1.8" fill="#0284c7" />
    <circle cx="32" cy="23" r="1.8" fill="#ffffff" opacity="0.9" />
    <line x1="32" y1="23" x2="32" y2="32" stroke="#ffffff" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.75" />
  </svg>
);

export const CubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

export const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

export const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

export const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export const TrendingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export const FlaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31L4.69 19.34A2 2 0 0 0 6.43 22h11.14a2 2 0 0 0 1.74-2.66L14 9.31V2"></path>
    <line x1="8.5" y1="2" x2="15.5" y2="2"></line>
    <line x1="14" y1="9" x2="10" y2="9"></line>
  </svg>
);

export const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);
