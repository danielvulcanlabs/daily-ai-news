'use client';

import { useState } from 'react';
import { signInWithSSO, type SSOProvider } from '@/lib/firebase/auth';

const providers: { id: SSOProvider; name: string; icon: React.ReactNode; bg: string; bgHover: string; text: string; border: string; shadow: string }[] = [
  {
    id: 'google',
    name: 'Google',
    bg: '#ffffff',
    bgHover: '#f8f8f8',
    text: '#1f1f1f',
    border: 'rgba(0,0,0,0.08)',
    shadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    bg: 'rgba(255,255,255,0.06)',
    bgHover: 'rgba(255,255,255,0.09)',
    text: '#f0ece4',
    border: 'rgba(255,255,255,0.08)',
    shadow: '0 1px 3px rgba(0,0,0,0.15)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#f0ece4">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    bg: 'rgba(255,255,255,0.06)',
    bgHover: 'rgba(255,255,255,0.09)',
    text: '#f0ece4',
    border: 'rgba(255,255,255,0.08)',
    shadow: '0 1px 3px rgba(0,0,0,0.15)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
        <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple',
    bg: 'rgba(255,255,255,0.06)',
    bgHover: 'rgba(255,255,255,0.09)',
    text: '#f0ece4',
    border: 'rgba(255,255,255,0.08)',
    shadow: '0 1px 3px rgba(0,0,0,0.15)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#f0ece4">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
];

export function LoginForm() {
  const [loadingId, setLoadingId] = useState<SSOProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  async function handleLogin(provider: SSOProvider) {
    try {
      setLoadingId(provider);
      setError(null);
      await signInWithSSO(provider);
      // Auth state change will re-render the root page automatically
      // Only do hard navigation if we're on /login (not root)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {providers.map((p, i) => {
        const isHovered = hoveredId === p.id;
        const isLoading = loadingId === p.id;
        const isDisabled = loadingId !== null;

        return (
          <button
            key={p.id}
            onClick={() => handleLogin(p.id)}
            disabled={isDisabled}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '13px 16px',
              borderRadius: '14px',
              border: `1px solid ${isHovered ? 'rgba(255,255,255,0.15)' : p.border}`,
              background: isHovered ? p.bgHover : p.bg,
              color: p.text,
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled && !isLoading ? 0.4 : 1,
              transition: 'all 0.2s ease',
              boxShadow: isHovered
                ? `${p.shadow}, 0 0 0 1px rgba(255,255,255,0.04)`
                : p.shadow,
              transform: isHovered && !isDisabled ? 'translateY(-1px)' : 'none',
              outline: 'none',
              fontFamily: 'inherit',
              animation: `btnSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both ${i * 0.06}s`,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
              {p.icon}
            </span>
            <span>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Connecting...
                </span>
              ) : `Continue with ${p.name}`}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '6px 0 2px',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
        <span style={{ fontSize: '10px', color: 'rgba(110,107,103,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
          Secure SSO
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        paddingTop: '2px',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(110,107,103,0.45)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(62,207,142,0.5)" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Encrypted
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(110,107,103,0.45)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(62,207,142,0.5)" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          No password stored
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 14px',
          borderRadius: '12px',
          background: 'rgba(229,82,82,0.08)',
          border: '1px solid rgba(229,82,82,0.15)',
          marginTop: '4px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e55252" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p style={{ fontSize: '12px', color: '#e55252', margin: 0 }}>{error}</p>
        </div>
      )}

      <style>{`
        @keyframes btnSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
