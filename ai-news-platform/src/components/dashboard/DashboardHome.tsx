'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getDigest, getUserConnectors, getUserTopics } from '@/lib/firebase/firestore';
import type { Digest } from '@/types/digest';
import type { UserConnector } from '@/types/connector';
import type { Topic } from '@/types/topic';
import Link from 'next/link';

/* ═══════════════════════════════════════
   Onboarding — shown when user has no connectors or topics
   ═══════════════════════════════════════ */
function OnboardingView({ connectorCount, topicCount }: { connectorCount: number; topicCount: number }) {
  const { profile } = useAuth();

  const steps = [
    {
      num: '01',
      title: 'Connect your tools',
      desc: 'Link Slack, Email, Calendar, and AI tools so we can gather news for you.',
      href: '/connectors',
      done: connectorCount > 0,
      color: '#c8a76a',
      bg: 'rgba(200,167,106,0.06)',
      border: 'rgba(200,167,106,0.15)',
    },
    {
      num: '02',
      title: 'Define your topics',
      desc: 'Tell us what you care about — we\'ll watch for updates across all your sources.',
      href: '/dashboard',
      done: topicCount > 0,
      color: '#5d8dee',
      bg: 'rgba(93,141,238,0.06)',
      border: 'rgba(93,141,238,0.15)',
    },
    {
      num: '03',
      title: 'Get your daily news',
      desc: 'Sit back. Your personalized AI digest arrives at 6am and updates at noon.',
      href: '/',
      done: connectorCount > 0 && topicCount > 0,
      color: '#3ecf8e',
      bg: 'rgba(62,207,142,0.06)',
      border: 'rgba(62,207,142,0.15)',
    },
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '40px' }}>
      {/* Welcome */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(145deg, #d4b577, #9a7038)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(200,167,106,0.3)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
          </svg>
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#f0ece4',
          letterSpacing: '-0.03em',
          margin: '0 0 8px',
        }}>
          Welcome, {profile?.displayName?.split(' ')[0] || 'there'}
        </h1>
        <p style={{ fontSize: '14px', color: '#8a8680', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto' }}>
          Set up your personalized AI news feed in 3 easy steps. It only takes a minute.
        </p>
      </div>

      {/* Steps */}
      <div style={{
        background: '#0f0f14',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {steps.map((step, i) => (
          <Link
            key={step.num}
            href={step.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              textDecoration: 'none',
              borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: 'background 0.15s ease',
              opacity: step.done ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Step number / check */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: step.done ? 'rgba(62,207,142,0.08)' : step.bg,
              border: `1px solid ${step.done ? 'rgba(62,207,142,0.15)' : step.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {step.done ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span style={{ fontSize: '13px', fontWeight: 700, color: step.color }}>{step.num}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: step.done ? '#6e6b67' : '#e8e4dc',
                textDecoration: step.done ? 'line-through' : 'none',
              }}>
                {step.title}
              </div>
              <div style={{ fontSize: '12px', color: '#6e6b67', marginTop: '3px', lineHeight: 1.4 }}>
                {step.desc}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a4845" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Daily News View — shows the digest content
   ═══════════════════════════════════════ */
function DailyNewsView({ digest }: { digest: Digest }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Masthead */}
      <div style={{
        background: '#0f0f14',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '18px',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(200,167,106,0.5), rgba(200,167,106,0.1), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(145deg, #d4b577, #9a7038)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(200,167,106,0.25)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f0ece4', letterSpacing: '-0.01em' }}>Your Daily News</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path d="M2 4l10 16L22 4" stroke="#e55252" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '10px', color: 'rgba(110,107,103,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  Vulcan Labs Daily
                </span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '99px',
              background: 'rgba(200,167,106,0.06)',
              border: '1px solid rgba(200,167,106,0.1)',
              marginBottom: '4px',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c8a76a', boxShadow: '0 0 4px rgba(200,167,106,0.4)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(200,167,106,0.8)' }}>Issue #{digest.issueNumber}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(110,107,103,0.4)' }}>{digest.id}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
        {[
          { value: digest.stats.totalStories, label: 'Stories', color: '#c8a76a', border: 'rgba(200,167,106,0.12)' },
          { value: digest.stats.sourcesQueried, label: 'Sources', color: '#5d8dee', border: 'rgba(93,141,238,0.12)' },
          { value: digest.stats.topicsMatched, label: 'Topics', color: '#3ecf8e', border: 'rgba(62,207,142,0.12)' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#0f0f14',
            border: `1px solid ${s.border}`,
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#6e6b67', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stories placeholder */}
      <div style={{
        background: '#0f0f14',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '48px 20px',
        textAlign: 'center',
        marginBottom: '18px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: 'rgba(93,141,238,0.06)', border: '1px solid rgba(93,141,238,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(93,141,238,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
          </svg>
        </div>
        <div style={{ fontSize: '14px', color: '#8a8680', fontWeight: 500 }}>Digest content renders here</div>
        <div style={{ fontSize: '12px', color: 'rgba(110,107,103,0.4)', marginTop: '6px' }}>
          {digest.stories.length} stories · {digest.repos.length} repos
        </div>
      </div>

      {/* Signal sources */}
      {digest.signalSources.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)' }} />
            <span style={{ fontSize: '10px', color: 'rgba(110,107,103,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Signal sources</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04))' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {digest.signalSources.map((src) => (
              <span key={src} style={{
                fontSize: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '99px', padding: '4px 12px', color: '#8a8680', fontWeight: 500,
              }}>{src}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   No digest yet today — but user has set up
   ═══════════════════════════════════════ */
function NoDigestTodayView() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '60px' }}>
      <div style={{
        textAlign: 'center',
        padding: '48px 20px',
        background: '#0f0f14',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'rgba(200,167,106,0.06)', border: '1px solid rgba(200,167,106,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(200,167,106,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e8e4dc', margin: 0 }}>No news for today yet</h2>
        <p style={{ fontSize: '13px', color: '#6e6b67', marginTop: '8px', lineHeight: 1.5 }}>
          Your digest will be automatically generated at 6am tomorrow. Check back soon!
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Main Component
   ═══════════════════════════════════════ */
export default function DashboardHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectors, setConnectors] = useState<UserConnector[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [digest, setDigest] = useState<Digest | null>(null);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      getUserConnectors(user.uid),
      getUserTopics(user.uid),
      getDigest(user.uid, today),
    ]).then(([c, t, d]) => {
      setConnectors(c);
      setTopics(t);
      setDigest(d);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6e6b67', fontSize: '13px' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Loading...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const hasSetup = connectors.some(c => c.status === 'connected') && topics.length > 0;

  // Not set up → onboarding
  if (!hasSetup) {
    return (
      <OnboardingView
        connectorCount={connectors.filter(c => c.status === 'connected').length}
        topicCount={topics.length}
      />
    );
  }

  // Set up but no digest today → waiting message
  if (!digest) {
    return <NoDigestTodayView />;
  }

  // Has digest → show daily news
  return <DailyNewsView digest={digest} />;
}
