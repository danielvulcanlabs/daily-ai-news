'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserConnectors } from '@/lib/firebase/firestore';
import { CONNECTOR_CATEGORIES, getConnectorsByCategory } from '@/lib/connectors/registry';
import type { UserConnector, ConnectorConfig, ConnectorCategory } from '@/types/connector';
import { auth } from '@/lib/firebase/config';

// ── Status Badge ──

function StatusBadge({ status, comingSoon }: { status: string; comingSoon?: boolean }) {
  if (comingSoon) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
        color: '#c8a76a', background: 'rgba(200,167,106,0.08)', border: '1px solid rgba(200,167,106,0.15)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        Coming Soon
      </span>
    );
  }

  const config: Record<string, { color: string; bg: string; border: string }> = {
    connected: { color: '#3ecf8e', bg: 'rgba(62,207,142,0.08)', border: 'rgba(62,207,142,0.15)' },
    disconnected: { color: '#6e6b67', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' },
    error: { color: '#e55252', bg: 'rgba(229,82,82,0.08)', border: 'rgba(229,82,82,0.15)' },
    expired: { color: '#c8a76a', bg: 'rgba(200,167,106,0.08)', border: 'rgba(200,167,106,0.15)' },
  };
  const s = config[status] || config.disconnected;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {status === 'connected' && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3ecf8e', boxShadow: '0 0 4px rgba(62,207,142,0.5)' }} />
      )}
      {status}
    </span>
  );
}

// ── Connector Card ──

function ConnectorCard({
  config,
  userConnector,
  onConnect,
  onDisconnect,
}: {
  config: ConnectorConfig;
  userConnector?: UserConnector;
  onConnect: (config: ConnectorConfig) => void;
  onDisconnect: (provider: string) => void;
}) {
  const isConnected = userConnector?.status === 'connected';
  const isComingSoon = config.comingSoon === true;
  const [disconnecting, setDisconnecting] = useState(false);

  const handleClick = async () => {
    if (isComingSoon) return;
    if (isConnected) {
      setDisconnecting(true);
      try {
        await onDisconnect(config.id);
      } finally {
        setDisconnecting(false);
      }
    } else {
      onConnect(config);
    }
  };

  return (
    <div style={{
      background: '#0f0f14',
      border: `1px solid ${isConnected ? 'rgba(62,207,142,0.12)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden',
      transition: 'all 0.2s ease',
      opacity: isComingSoon ? 0.6 : 1,
    }}
      onMouseEnter={(e) => {
        if (!isComingSoon) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isConnected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(62,207,142,0.5), transparent)' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', minWidth: '40px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${config.color}18, ${config.color}08)`,
            border: `1px solid ${config.color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <img src={config.icon} alt={config.name} width={28} height={28} style={{ objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e8e4dc' }}>{config.name}</div>
            <div style={{ fontSize: '12px', color: '#6e6b67', marginTop: '2px' }}>{config.description}</div>
          </div>
        </div>
        <StatusBadge status={userConnector?.status || 'disconnected'} comingSoon={isComingSoon} />
      </div>

      {userConnector?.lastSyncAt && (
        <div style={{ fontSize: '11px', color: 'rgba(110,107,103,0.5)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Last sync: {userConnector.lastSyncAt.toLocaleString('vi-VN')}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={isComingSoon || disconnecting}
        style={{
          width: '100%', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
          cursor: isComingSoon || disconnecting ? 'default' : 'pointer',
          transition: 'all 0.15s ease', fontFamily: 'inherit',
          border: isConnected ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.06)',
          background: isComingSoon
            ? 'rgba(255,255,255,0.02)'
            : isConnected
              ? 'rgba(255,255,255,0.03)'
              : 'linear-gradient(135deg, #c8a76a, #b08d4a)',
          color: isComingSoon
            ? '#4a4845'
            : isConnected
              ? '#8a8680'
              : '#07070a',
          boxShadow: isComingSoon || isConnected ? 'none' : '0 2px 8px rgba(200,167,106,0.2)',
        }}
        onMouseEnter={(e) => {
          if (isComingSoon) return;
          if (isConnected) {
            e.currentTarget.style.color = '#e55252';
            e.currentTarget.style.borderColor = 'rgba(229,82,82,0.2)';
            e.currentTarget.style.background = 'rgba(229,82,82,0.06)';
          } else {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,167,106,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (isComingSoon) return;
          if (isConnected) {
            e.currentTarget.style.color = '#8a8680';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          } else {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(200,167,106,0.2)';
          }
        }}
      >
        {isComingSoon ? 'Coming Soon' : disconnecting ? 'Disconnecting...' : isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}

// ── Category Icons ──

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'ai': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><path d="M12 2v4"/><circle cx="12" cy="2" r="1" fill="currentColor"/><path d="M2 15h3M19 15h3"/><path d="M8 11V9a4 4 0 018 0v2"/></svg>,
  'communication': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  'email': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  'calendar': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>,
  'tasks': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

// ── Toast notification ──

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 1100,
      padding: '12px 20px', borderRadius: '10px',
      background: type === 'success' ? 'rgba(62,207,142,0.12)' : 'rgba(229,82,82,0.12)',
      border: `1px solid ${type === 'success' ? 'rgba(62,207,142,0.2)' : 'rgba(229,82,82,0.2)'}`,
      color: type === 'success' ? '#3ecf8e' : '#e55252',
      fontSize: '13px', fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      {message}
    </div>
  );
}

// ── Main Page ──

export default function ConnectorsPage() {
  const { user } = useAuth();
  const [connectors, setConnectors] = useState<UserConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadConnectors = useCallback(async () => {
    if (!user) return;
    try {
      const c = await getUserConnectors(user.uid);
      setConnectors(c);
    } catch (err) {
      console.error('Failed to load connectors:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConnectors();
  }, [loadConnectors]);

  // Check URL params for OAuth callback results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected) {
      setToast({ message: `${connected} connected successfully!`, type: 'success' });
      loadConnectors();
      window.history.replaceState({}, '', '/connectors');
    } else if (error) {
      setToast({ message: `Connection failed: ${error}`, type: 'error' });
      window.history.replaceState({}, '', '/connectors');
    }
  }, [loadConnectors]);

  const getIdToken = async (): Promise<string> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('Not authenticated');
    return firebaseUser.getIdToken();
  };

  const handleConnect = async (config: ConnectorConfig) => {
    if (config.comingSoon || !config.oauth) return;

    // OAuth connector — redirect to auth URL with ID token
    try {
      const idToken = await getIdToken();
      window.location.href = `/api/connectors/${config.id}/auth?id_token=${encodeURIComponent(idToken)}`;
    } catch (err: any) {
      setToast({ message: err.message || 'Authentication error', type: 'error' });
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      const idToken = await getIdToken();
      const res = await fetch(`/api/connectors/${provider}/connect`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to disconnect');
      }

      setToast({ message: `${provider} disconnected`, type: 'success' });
      await loadConnectors();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to disconnect', type: 'error' });
    }
  };

  const connectorMap = new Map(connectors.map((c) => [c.provider, c]));

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0ece4', letterSpacing: '-0.02em', margin: 0 }}>
            Connectors
          </h1>
          <p style={{ fontSize: '13px', color: '#8a8680', marginTop: '4px' }}>
            Connect your tools so Smith Daily News can track updates for you
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(110,107,103,0.5)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3ecf8e' }} />
          {connectors.filter((c) => c.status === 'connected').length} connected
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6e6b67', fontSize: '13px' }}>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Loading connectors...
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {CONNECTOR_CATEGORIES.map((category) => {
            const categoryConnectors = getConnectorsByCategory(category.id as ConnectorCategory);
            return (
              <section key={category.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e6b67',
                  }}>
                    {CATEGORY_ICONS[category.id] || <span style={{ fontSize: '12px' }}>{category.icon}</span>}
                  </div>
                  <h2 style={{
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#6e6b67', margin: 0,
                  }}>
                    {category.label}
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {categoryConnectors.map((config) => (
                    <ConnectorCard
                      key={config.id}
                      config={config}
                      userConnector={connectorMap.get(config.id)}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
