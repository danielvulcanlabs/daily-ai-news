'use client';

import { useAuth } from '@/components/auth/AuthProvider';

export function Topbar() {
  const { profile } = useAuth();

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header style={{
      height: '56px',
      background: 'rgba(12,12,16,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
    }}>
      {/* Left: date */}
      <div style={{ fontSize: '13px', color: '#8a8680', fontWeight: 500 }}>
        {today}
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6e6b67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ fontSize: '12px', color: '#6e6b67', fontWeight: 500 }}>Search...</span>
          <kbd style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#6e6b67',
            lineHeight: 1.3,
          }}>/</kbd>
        </div>

        {/* Topics count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'rgba(200,167,106,0.06)',
          border: '1px solid rgba(200,167,106,0.1)',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#c8a76a',
            boxShadow: '0 0 6px rgba(200,167,106,0.4)',
          }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(200,167,106,0.8)' }}>
            {profile?.preferences?.focusAreas?.length || 0} topics
          </span>
        </div>

        {/* Notification */}
        <button
          style={{
            position: 'relative',
            padding: '7px',
            borderRadius: '8px',
            background: 'none',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: '#6e6b67',
            display: 'flex',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = '#9a958c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = '#6e6b67';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <div style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            width: '7px',
            height: '7px',
            background: '#e55252',
            borderRadius: '50%',
            border: '1.5px solid #0c0c10',
          }} />
        </button>
      </div>
    </header>
  );
}
