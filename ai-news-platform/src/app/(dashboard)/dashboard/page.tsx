'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserTopics, getUserConnectors, getRecentDigests, createTopic, deleteTopic } from '@/lib/firebase/firestore';
import type { Topic, CreateTopicInput } from '@/types/topic';

/* ─── Stat Card ─── */
function StatCard({ value, label, color, border, icon }: {
  value: number | string; label: string; color: string; border: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#0f0f14',
      border: `1px solid ${border}`,
      borderRadius: '14px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}40, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: `${color}60`, display: 'flex' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#6e6b67', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

/* ─── Topic Card ─── */
function TopicCard({ topic, onDelete }: { topic: Topic; onDelete: (id: string) => void }) {
  const priorityStyles = {
    high: { color: '#e55252', bg: 'rgba(229,82,82,0.06)', border: 'rgba(229,82,82,0.12)', line: '#e55252' },
    medium: { color: '#c8a76a', bg: 'rgba(200,167,106,0.06)', border: 'rgba(200,167,106,0.12)', line: '#c8a76a' },
    low: { color: '#6e6b67', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', line: '#4a4845' },
  };
  const p = priorityStyles[topic.priority];

  return (
    <div
      style={{
        background: '#0f0f14',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        const delBtn = e.currentTarget.querySelector('[data-del]') as HTMLElement;
        if (delBtn) delBtn.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'none';
        const delBtn = e.currentTarget.querySelector('[data-del]') as HTMLElement;
        if (delBtn) delBtn.style.opacity = '0';
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: p.line, borderRadius: '0 2px 2px 0', opacity: 0.6 }} />
      <div style={{ paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e8e4dc', margin: 0 }}>{topic.name}</h3>
            <p style={{ fontSize: '12px', color: '#6e6b67', marginTop: '3px', lineHeight: 1.4 }}>{topic.description}</p>
          </div>
          <span style={{
            display: 'inline-flex', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
            color: p.color, background: p.bg, border: `1px solid ${p.border}`, flexShrink: 0, marginLeft: '12px',
          }}>
            {topic.priority}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
          {topic.keywords.map((kw) => (
            <span key={kw} style={{
              fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px',
              background: 'rgba(93,141,238,0.06)', color: '#5d8dee', border: '1px solid rgba(93,141,238,0.1)',
            }}>{kw}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {topic.sources.map((src) => (
              <span key={src} style={{
                fontSize: '10px', color: 'rgba(110,107,103,0.5)', background: 'rgba(255,255,255,0.03)',
                padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)',
              }}>{src}</span>
            ))}
          </div>
          <button
            data-del=""
            onClick={() => onDelete(topic.id)}
            style={{
              opacity: 0, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6e6b67',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
              borderRadius: '6px', transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e55252'; e.currentTarget.style.background = 'rgba(229,82,82,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6e6b67'; e.currentTarget.style.background = 'none'; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create Topic Form ─── */
function CreateTopicForm({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    const input: CreateTopicInput = {
      name: name.trim(),
      description: description.trim(),
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      sources: [],
      priority,
    };
    await createTopic(user.uid, input);
    setName(''); setDescription(''); setKeywords(''); setPriority('medium');
    setOpen(false); setSaving(false);
    onCreated();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #c8a76a, #b08d4a)', color: '#07070a', fontSize: '13px',
          fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 2px 8px rgba(200,167,106,0.2)', transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,167,106,0.3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(200,167,106,0.2)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Topic
      </button>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(22,22,29,0.8)', border: '1px solid rgba(48,48,62,0.8)',
    color: '#f0ece4', fontSize: '14px', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#0f0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
      padding: '24px', position: 'relative', overflow: 'hidden', gridColumn: '1 / -1',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(200,167,106,0.5), transparent)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e6b67', display: 'block', marginBottom: '6px' }}>Topic Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Agentic Memory Systems" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e6b67', display: 'block', marginBottom: '6px' }}>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this topic covers" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e6b67', display: 'block', marginBottom: '6px' }}>Keywords (comma-separated)</label>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="memory, long-term memory, RAG, context window" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e6b67', display: 'block', marginBottom: '6px' }}>Priority</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPriority(p)} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                border: `1px solid ${priority === p ? 'rgba(200,167,106,0.2)' : 'rgba(255,255,255,0.06)'}`,
                background: priority === p ? 'rgba(200,167,106,0.08)' : 'rgba(255,255,255,0.02)',
                color: priority === p ? '#c8a76a' : '#6e6b67',
              }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button type="submit" disabled={saving || !name.trim()} style={{
            padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #c8a76a, #b08d4a)',
            color: '#07070a', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            opacity: saving || !name.trim() ? 0.5 : 1,
          }}>
            {saving ? 'Creating...' : 'Create Topic'}
          </button>
          <button type="button" onClick={() => setOpen(false)} style={{
            padding: '10px 16px', borderRadius: '10px', background: 'none', color: '#6e6b67',
            fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════
   Dashboard Page — stats + topic management
   ═══════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [connectorCount, setConnectorCount] = useState(0);
  const [digestCount, setDigestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  function loadData() {
    if (!user) return;
    Promise.all([
      getUserTopics(user.uid),
      getUserConnectors(user.uid),
      getRecentDigests(user.uid, 30),
    ]).then(([t, c, d]) => {
      setTopics(t);
      setConnectorCount(c.filter(cn => cn.status === 'connected').length);
      setDigestCount(d.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [user]);

  async function handleDelete(topicId: string) {
    if (!user) return;
    await deleteTopic(user.uid, topicId);
    loadData();
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6e6b67', fontSize: '13px' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Loading dashboard...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const todayUpdates = topics.length > 0 ? topics.length * 2 : 0; // placeholder until real update counts

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0ece4', letterSpacing: '-0.02em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#8a8680', marginTop: '4px' }}>
          Overview of your news setup — connectors, topics, and digest performance
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        <StatCard
          value={connectorCount}
          label="Active Connectors"
          color="#c8a76a"
          border="rgba(200,167,106,0.12)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          }
        />
        <StatCard
          value={topics.length}
          label="Active Topics"
          color="#5d8dee"
          border="rgba(93,141,238,0.12)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          }
        />
        <StatCard
          value={todayUpdates}
          label="Updates Today"
          color="#3ecf8e"
          border="rgba(62,207,142,0.12)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
        <StatCard
          value={digestCount}
          label="Digest Issues"
          color="#9d78f0"
          border="rgba(157,120,240,0.12)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
            </svg>
          }
        />
      </div>

      {/* Topics section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e8e4dc', margin: 0 }}>Your Topics</h2>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
            background: 'rgba(93,141,238,0.06)', color: '#5d8dee', border: '1px solid rgba(93,141,238,0.1)',
          }}>
            {topics.length}
          </span>
        </div>
        <CreateTopicForm onCreated={loadData} />
      </div>

      {topics.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: '#0f0f14',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(200,167,106,0.06)',
            border: '1px solid rgba(200,167,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(200,167,106,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e4dc' }}>No topics yet</div>
          <div style={{ fontSize: '13px', color: '#6e6b67', marginTop: '6px' }}>Create your first topic to start tracking AI news updates</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
