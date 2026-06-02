'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile, getRecentDigests } from '@/lib/firebase/firestore';
import type { Digest } from '@/types/digest';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [timezone, setTimezone] = useState(profile?.preferences?.timezone || 'Asia/Ho_Chi_Minh');
  const [language, setLanguage] = useState<'vi' | 'en'>(profile?.preferences?.language || 'vi');
  const [morningTime, setMorningTime] = useState(profile?.preferences?.digestTime?.morning || '06:00');
  const [middayTime, setMiddayTime] = useState(profile?.preferences?.digestTime?.midday || '12:00');
  const [recentDigests, setRecentDigests] = useState<Digest[]>([]);
  const [digestsLoading, setDigestsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getRecentDigests(user.uid, 30).then((d) => {
      setRecentDigests(d);
      setDigestsLoading(false);
    }).catch(() => setDigestsLoading(false));
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await updateUserProfile(user.uid, {
      preferences: {
        timezone,
        language,
        digestTime: { morning: morningTime, midday: middayTime },
        focusAreas: profile?.preferences?.focusAreas || [],
      },
    } as any);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const sectionStyle: React.CSSProperties = {
    background: '#0f0f14',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#6e6b67',
    display: 'block',
    marginBottom: '8px',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(22,22,29,0.8)',
    border: '1px solid rgba(48,48,62,0.8)',
    color: '#f0ece4',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(22,22,29,0.8)',
    border: '1px solid rgba(48,48,62,0.8)',
    color: '#f0ece4',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0ece4', letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: '13px', color: '#8a8680', marginTop: '4px' }}>Configure your digest preferences and platform settings</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Profile */}
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(200,167,106,0.4), transparent)' }} />
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#e8e4dc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(200,167,106,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" referrerPolicy="no-referrer" style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  border: '2px solid rgba(200,167,106,0.2)',
                }} />
              ) : (
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1d1d27, #30303e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#9a958c',
                  border: '2px solid rgba(255,255,255,0.06)',
                }}>
                  {profile?.displayName?.[0]}
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '12px',
                height: '12px',
                background: '#3ecf8e',
                borderRadius: '50%',
                border: '2px solid #0f0f14',
              }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e4dc' }}>{profile?.displayName}</div>
              <div style={{ fontSize: '13px', color: '#6e6b67', marginTop: '2px' }}>{profile?.email}</div>
              <span style={{
                display: 'inline-block',
                marginTop: '6px',
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(110,107,103,0.5)',
              }}>
                via {profile?.provider}
              </span>
            </div>
          </div>
        </section>

        {/* Digest Preferences */}
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(93,141,238,0.4), transparent)' }} />
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#e8e4dc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(93,141,238,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            Digest Preferences
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={selectStyle}>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (UTC+7)</option>
                <option value="America/New_York">America/New York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')} style={selectStyle}>
                <option value="vi">Tieng Viet</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Morning Digest</label>
              <input type="time" value={morningTime} onChange={(e) => setMorningTime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Midday Update</label>
              <input type="time" value={middayTime} onChange={(e) => setMiddayTime(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #c8a76a, #b08d4a)',
                color: '#07070a',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: saving ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(200,167,106,0.2)',
              }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#3ecf8e', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved
              </span>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(229,82,82,0.4), transparent)' }} />
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#e8e4dc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(229,82,82,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Danger Zone
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(110,107,103,0.5)', marginBottom: '14px' }}>Irreversible actions — please be careful</p>
          <button
            style={{
              fontSize: '12px',
              color: 'rgba(229,82,82,0.6)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(229,82,82,0.1)',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e55252';
              e.currentTarget.style.borderColor = 'rgba(229,82,82,0.2)';
              e.currentTarget.style.background = 'rgba(229,82,82,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(229,82,82,0.6)';
              e.currentTarget.style.borderColor = 'rgba(229,82,82,0.1)';
              e.currentTarget.style.background = 'none';
            }}
          >
            Delete Account & Data
          </button>
        </section>

        {/* ─── Divider ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
          <span style={{ fontSize: '10px', color: 'rgba(110,107,103,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>History</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06))' }} />
        </div>

        {/* ─── Recent News ─── */}
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(157,120,240,0.4), transparent)' }} />
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#e8e4dc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(157,120,240,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
            </svg>
            Recent News
          </h2>

          {digestsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6b67', fontSize: '12px', padding: '16px 0' }}>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading history...
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : recentDigests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: '13px', color: '#6e6b67' }}>No digest history yet</div>
              <div style={{ fontSize: '11px', color: 'rgba(110,107,103,0.4)', marginTop: '4px' }}>
                Your daily news digests will appear here
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentDigests.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    transition: 'background 0.15s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(157,120,240,0.06)', border: '1px solid rgba(157,120,240,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9d78f0' }}>#{d.issueNumber}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8e4dc' }}>{d.id}</div>
                      <div style={{ fontSize: '11px', color: '#6e6b67', marginTop: '2px' }}>
                        {d.stats.totalStories} stories · {d.stats.sourcesQueried} sources · {d.stats.topicsMatched} topics
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {d.signalSources.slice(0, 3).map((src) => (
                      <span key={src} style={{
                        fontSize: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '99px', padding: '2px 8px', color: '#6e6b67',
                      }}>{src}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
