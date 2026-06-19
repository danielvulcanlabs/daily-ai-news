'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { user, loading } = useAuth();

  // Already logged in — go to root which shows dashboard
  if (!loading && user) {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      window.location.href = '/';
    }
    return null;
  }

  // Still loading auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }`}</style>
      </div>
    );
  }

  // Not logged in — show login form
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07070a',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>
      {/* ── Background layers ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(93,141,238,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(200,167,106,0.05) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* ── Content ── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        animation: 'loginFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '24px',
              background: 'radial-gradient(circle, rgba(200,167,106,0.35) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }} />
            <div style={{
              position: 'relative',
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #d4b577 0%, #c8a76a 40%, #9a7038 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 40px rgba(200,167,106,0.3), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.25)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #e8d5a8 0%, #c8a76a 40%, #b08d4a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Smith Daily News
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(154,149,140,0.7)',
              marginTop: '8px',
              letterSpacing: '0.03em',
              fontWeight: 400,
            }}>
              Personalized AI news & insights platform
            </p>
          </div>
        </div>

        {/* ── Card ── */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(160deg, rgba(22,22,29,0.95) 0%, rgba(15,15,20,0.9) 100%)',
          borderRadius: '24px',
          padding: '36px 32px 32px',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,167,106,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '32px',
            right: '32px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(200,167,106,0.4) 50%, transparent 100%)',
          }} />

          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#f0ece4',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(154,149,140,0.65)',
            marginBottom: '28px',
            lineHeight: 1.5,
          }}>
            Sign in with your preferred account to continue
          </p>

          <LoginForm />
        </div>

        <p style={{
          fontSize: '12px',
          color: 'rgba(110,107,103,0.4)',
          maxWidth: '320px',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
