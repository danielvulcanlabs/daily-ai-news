'use client';

// Root "/" — auth-aware router
// If logged in: show dashboard. If not: show login.
// NO redirects, NO navigation — just conditional rendering.

import { useAuth } from '@/components/auth/AuthProvider';
import LoginPageContent from '@/components/auth/LoginPageContent';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function RootPage() {
  const { user, loading } = useAuth();

  // Loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#07070a',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #d4b577, #9a7038)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
          </svg>
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }`}</style>
      </div>
    );
  }

  // Not logged in → Login
  if (!user) {
    return <LoginPageContent />;
  }

  // Logged in → Dashboard
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#07070a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
          <DashboardHome />
        </main>
      </div>
    </div>
  );
}
