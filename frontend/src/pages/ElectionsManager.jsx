import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_MAP = {
  DRAFT:  { label: 'Not Activated', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  ACTIVE: { label: 'Live',          color: '#10B981', bg: 'rgba(16,185,129,0.12)',  dot: '#10B981' },
  CLOSED: { label: 'Expired',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   dot: '#EF4444' },
};

const STATUS_OPTIONS = [
  { value: 'DRAFT',  label: '⚪  Not Activated' },
  { value: 'ACTIVE', label: '🟢  Live' },
  { value: 'CLOSED', label: '🔴  Expired' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const totalVotesSum = (elections) => elections.reduce((s, e) => s + (e.totalVotes || 0), 0);

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.DRAFT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700,
      letterSpacing: 0.5,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block',
        boxShadow: status === 'ACTIVE' ? `0 0 6px ${s.dot}` : 'none',
        animation: status === 'ACTIVE' ? 'pulse 1.5s infinite' : 'none'
      }} />
      {s.label}
    </span>
  );
}

// ─── Election Row ─────────────────────────────────────────────────────────────
function ElectionRow({ election, onStatusChange, updating }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{
      background: '#1B2A3B', borderRadius: 12, border: '1px solid #1E3048',
      padding: '20px 24px', display: 'grid',
      gridTemplateColumns: '1fr 160px 160px 120px 180px',
      alignItems: 'center', gap: 16,
      transition: 'all 0.2s',
    }}
      className="election-row-inner"
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A4060'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E3048'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div>
        <div style={{ color: '#F1F5F9', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{election.title}</div>
        {election.description && (
          <div style={{ color: '#64748B', fontSize: 12, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {election.description}
          </div>
        )}
        <div style={{ color: '#334155', fontSize: 11, marginTop: 4 }}>
          ID: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{election._id?.slice(-8)}</span>
        </div>
      </div>

      <div style={{ color: '#94A3B8', fontSize: 12 }} className="hide-mobile">
        <div style={{ color: '#64748B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Start</div>
        {fmt(election.startTime)}
      </div>

      <div style={{ color: '#94A3B8', fontSize: 12 }} className="hide-mobile">
        <div style={{ color: '#64748B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>End</div>
        {fmt(election.endTime)}
      </div>

      <div style={{ textAlign: 'center' }} className="hide-mobile">
        <div style={{ color: '#00D4AA', fontSize: 22, fontWeight: 800 }}>{election.totalVotes || 0}</div>
        <div style={{ color: '#475569', fontSize: 11 }}>votes</div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }} ref={ref}>
        <div onClick={() => !updating && setOpen(o => !o)} style={{ cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1, display: 'flex', alignItems: 'center' }}>
          <StatusBadge status={election.status} />
          <span style={{ color: '#475569', fontSize: 10, marginLeft: 6 }}>▼</span>
        </div>
        {open && (
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 100,
            background: '#162032', border: '1px solid #1E3048', borderRadius: 10,
            minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', overflow: 'hidden',
          }}>
            {STATUS_OPTIONS.map(opt => (
              <div key={opt.value}
                onClick={() => { onStatusChange(election._id, opt.value); setOpen(false); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer', fontSize: 13,
                  color: election.status === opt.value ? '#00D4AA' : '#94A3B8',
                  background: election.status === opt.value ? 'rgba(0,212,170,0.08)' : 'transparent',
                  fontWeight: election.status === opt.value ? 700 : 400,
                  transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1B2A3B'; }}
                onMouseLeave={e => { e.currentTarget.style.background = election.status === opt.value ? 'rgba(0,212,170,0.08)' : 'transparent'; }}
              >
                {opt.label}
                {election.status === opt.value && <span>✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ElectionsManager() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [filter, setFilter]       = useState('ALL');
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const res = await adminAPI.getElections();
      setElections(res.data);
    } catch {
      showToast('Failed to load elections', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await adminAPI.setStatus(id, newStatus);
      setElections(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
      showToast(`Status updated to "${STATUS_MAP[newStatus]?.label}"`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const visible = elections
    .filter(e => filter === 'ALL' || e.status === filter)
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    ALL: elections.length,
    ACTIVE: elections.filter(e => e.status === 'ACTIVE').length,
    DRAFT:  elections.filter(e => e.status === 'DRAFT').length,
    CLOSED: elections.filter(e => e.status === 'CLOSED').length,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', color: '#FFF' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#0F2E1A' : '#2E0F0F',
          border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: toast.type === 'success' ? '#10B981' : '#EF4444',
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      <header style={{ background: '#1B2A3B', borderBottom: '1px solid #1E3048', padding: '16px 20px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/admin" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div style={{ width: 1, height: 20, background: '#1E3048' }} className="hidden sm:block" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🗳️</span>
            <span style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: '#F1F5F9' }}>Elections Manager</span>
          </div>
        </div>
        <button onClick={load} style={{ background: '#162032', border: '1px solid #1E3048', color: '#94A3B8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          ⟳ Refresh
        </button>
      </header>

      <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { key: 'ALL',    label: 'Total',         color: '#00D4AA', icon: '📋' },
            { key: 'ACTIVE', label: 'Live Now',       color: '#10B981', icon: '🟢' },
            { key: 'DRAFT',  label: 'Not Activated',  color: '#F59E0B', icon: '⚪' },
            { key: 'CLOSED', label: 'Expired',        color: '#EF4444', icon: '🔴' },
          ].map(card => (
            <div key={card.key}
              onClick={() => setFilter(card.key)}
              style={{
                background: filter === card.key ? `rgba(${card.color === '#00D4AA' ? '0,212,170' : card.color === '#10B981' ? '16,185,129' : card.color === '#F59E0B' ? '245,158,11' : '239,68,68'},0.1)` : '#1B2A3B',
                border: `1px solid ${filter === card.key ? card.color + '66' : '#1E3048'}`,
                borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{counts[card.key]}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            placeholder="Search elections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px', background: '#1B2A3B', minWidth: '240px',
              border: '1px solid #1E3048', borderRadius: 10, color: '#F1F5F9',
              fontSize: 14, outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#334155' }}>
            <div style={{ fontSize: 16 }}>Loading elections…</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map(election => (
              <ElectionRow
                key={election._id}
                election={election}
                onStatusChange={handleStatusChange}
                updating={updating === election._id}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; box-shadow:0 0 6px #10B981; } 50% { opacity:0.5; box-shadow:0 0 14px #10B981; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        
        @media (max-width: 1023px) {
          .election-row-inner {
            grid-template-columns: 1fr auto !important;
            padding: 16px !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
