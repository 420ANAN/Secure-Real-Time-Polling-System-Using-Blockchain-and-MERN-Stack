import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';

const S = (x, y, w, h, bg) => ({
  position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: bg, overflow: 'hidden'
});
const T = (x, y, w, h, color, size, align = 'left', bold = false) => ({
  position: 'absolute', left: x, top: y, width: w, height: h, color,
  fontSize: size, textAlign: align, fontWeight: bold ? 'bold' : 'normal',
  display: 'flex', alignItems: 'center',
  justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
  paddingLeft: align === 'left' ? 8 : 0, paddingRight: align === 'right' ? 8 : 0,
  cursor: 'default', userSelect: 'none'
});
const BTN = (x, y, w, h, bg, color) => ({
  position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: bg, color,
  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
});

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalElections: 0, activeElections: 0, totalVotes: 0, elections: [] });
  const [audit, setAudit] = useState([]);
  const [showNewElection, setShowNewElection] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    try {
      const [d, a] = await Promise.all([adminAPI.getDashboard(), adminAPI.getAuditLogs()]);
      setStats(d.data);
      setAudit(a.data.slice(0, 4));
    } catch (e) {
      setToast('Backend offline – showing demo data');
      setStats({
        totalElections: 12, activeElections: 3, totalVotes: 5891,
        elections: [
          { _id: '1', title: 'General Election 2025', status: 'ACTIVE', totalVotes: 3241 },
          { _id: '2', title: 'Senate By-Election', status: 'ACTIVE', totalVotes: 1882 },
          { _id: '3', title: 'Local Council Vote', status: 'DRAFT', totalVotes: 0 },
        ]
      });
      setAudit([
        { _id: 'a1', action: 'Election Started', createdAt: new Date(), actor: 'Admin' },
        { _id: 'a2', action: 'Voter Whitelisted', createdAt: new Date(), actor: 'Admin' },
        { _id: 'a3', action: 'Candidate Added', createdAt: new Date(), actor: 'Admin' },
        { _id: 'a4', action: 'Election Created', createdAt: new Date(), actor: 'Admin' },
      ]);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async () => {
    if (!form.title) return showToast('Title required');
    setSaving(true);
    try {
      await adminAPI.createElection(form);
      showToast('Election created on blockchain!');
      setShowNewElection(false);
      setForm({ title: '', description: '', startTime: '', endTime: '' });
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Error creating election'); }
    setSaving(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.setStatus(id, status);
      showToast(`Election set to ${status}`);
      load();
    } catch (e) { showToast('Failed to update status'); }
  };

  const handleEmergencyStop = async () => {
    if (!window.confirm('⚠ CONFIRM: Invoke emergencyStopVoting() on all ACTIVE elections?')) return;
    try {
      for (const e of stats.elections.filter(e => e.status === 'ACTIVE')) {
        await adminAPI.emergencyStop(e._id, true);
      }
      showToast('Emergency stop triggered on all active elections!');
      load();
    } catch (e) { showToast('Emergency stop failed'); }
  };

  const statusColor = { ACTIVE: '#10B981', DRAFT: '#F59E0B', CLOSED: '#94A3B8' };
  const now = new Date();
  const timeStr = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';

  return (
    <div style={{ width: 960, height: 540, position: 'relative', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', overflow: 'hidden' }}>

      {/* Toast */}
      {toast && <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', background: '#1B4332', color: '#00D4AA', padding: '8px 20px', borderRadius: 6, zIndex: 200, fontSize: 13, border: '1px solid #00D4AA' }}>{toast}</div>}

      {/* Header */}
      <div style={S(0, 0, 960, 67, '#1B2A3B')} />
      <div style={S(0, 0, 960, 3, '#EF4444')} />
      <Link to="/" style={{ ...T(20, 3, 140, 59, '#94A3B8', 12, 'left', true), textDecoration: 'none', cursor: 'pointer' }}>
        ← RETURN HOME
      </Link>
      <img src="/image-1-1.png" alt="logo" style={{ position: 'absolute', left: 170, top: 13, width: 30, height: 30 }} />
      <div style={T(210, 3, 440, 59, '#FFFFFF', 22, 'left', true)}>BlockVote Admin Dashboard</div>
      <div style={T(528, 3, 412, 59, '#94A3B8', 12, 'right')}>Admin: 0x8A3F...d92B  ●  Connected</div>

      {/* Sidebar */}
      <div style={S(0, 67, 172, 475, '#1B2A3B')} />
      {[
        { label: 'Dashboard', y: 72, active: true, action: null },
        { label: 'Elections', y: 129, action: () => onNavigate('elections') },
        { label: 'Voters', y: 187, action: () => onNavigate('whitelist') },
        { label: 'Candidates', y: 244, action: () => onNavigate('candidates') },
        { label: 'Results', y: 302, action: () => onNavigate('results') },
        { label: 'Audit Log', y: 360, action: () => onNavigate('audit') },
        { label: 'Settings', y: 417, action: null },
      ].map(item => (
        <div key={item.label}>
          {item.active && <div style={S(0, item.y, 172, 48, '#EF4444')} />}
          <div
            onClick={item.action || undefined}
            style={{ ...T(9, item.y, 153, 48, item.active ? '#FFFFFF' : '#94A3B8', 15, 'left', item.active), cursor: item.action ? 'pointer' : 'default' }}
            onMouseEnter={e => { if (!item.active && item.action) e.target.style.color = '#FFFFFF'; }}
            onMouseLeave={e => { if (!item.active) e.target.style.color = '#94A3B8'; }}
          >{item.label}</div>
        </div>
      ))}

      {/* Stats Cards */}
      {[
        { x: 187, color: '#00D4AA', value: stats.totalElections, label: 'Total Elections', sub: `${stats.activeElections} Active` },
        { x: 379, color: '#0EA5E9', value: '8,432', label: 'Registered Voters', sub: '+124 today' },
        { x: 571, color: '#10B981', value: stats.totalVotes.toLocaleString(), label: 'Votes Cast', sub: '69.9% turnout' },
        { x: 763, color: '#F59E0B', value: 'LIVE', label: 'System Status', sub: 'All systems normal' },
      ].map((c, i) => (
        <div key={i}>
          <div style={S(c.x, 81, 177, 110, '#1B2A3B')} />
          <div style={S(c.x, 81, 5, 110, c.color)} />
          <div style={T(c.x + 12, 86, 158, 52, c.color, 30, 'left', true)}>{c.value}</div>
          <div style={T(c.x + 12, 134, 158, 24, '#94A3B8', 12)}>{c.label}</div>
          <div style={T(c.x + 12, 158, 158, 24, c.color, 12, 'left', true)}>{c.sub}</div>
        </div>
      ))}

      {/* Active Elections Table */}
      <div style={S(182, 206, 547, 278, '#1B2A3B')} />
      <div style={T(187, 211, 384, 33, '#FFFFFF', 17, 'left', true)}>Active Elections</div>
      <button onClick={() => setShowNewElection(true)} style={BTN(580, 214, 134, 26, '#00D4AA', '#000')}>+ New Election</button>

      {/* Table Header */}
      {[['Election Name', 192, 211], ['Status', 403, 86], ['Votes', 489, 76], ['Ends', 566, 86]].map(([t, x, w]) => (
        <div key={t}>
          <div style={S(x, 249, w, 26, '#162032')} />
          <div style={T(x, 249, w, 26, '#00D4AA', 11, 'left', true)}>{t}</div>
        </div>
      ))}

      {/* Table Rows */}
      {(stats.elections || []).slice(0, 3).map((el, i) => {
        const bg = i % 2 === 0 ? '#162032' : '#1B2A3B';
        const y = 281 + i * 40;
        const sc = statusColor[el.status] || '#94A3B8';
        return (
          <div key={el._id}>
            <div style={S(192, y, 211, 36, bg)} /><div style={T(192, y, 211, 36, '#FFFFFF', 13)}>{el.title}</div>
            <div style={S(403, y, 86, 36, bg)} />
            <div style={{ ...T(403, y, 86, 36, sc, 12, 'left', true), cursor: 'pointer' }}
              onClick={() => handleStatusChange(el._id, el.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE')}>
              {el.status}
            </div>
            <div style={S(489, y, 76, 36, bg)} /><div style={T(489, y, 76, 36, '#FFFFFF', 13)}>{(el.totalVotes || 0).toLocaleString()}</div>
            <div style={S(566, y, 86, 36, bg)} /><div style={T(566, y, 86, 36, '#FFFFFF', 12)}>{el.endTime ? new Date(el.endTime).toLocaleDateString() : 'TBD'}</div>
          </div>
        );
      })}

      {/* Emergency Stop */}
      <div style={S(182, 456, 547, 52, '#3B0A0A')} />
      <button onClick={handleEmergencyStop} style={BTN(182, 456, 547, 52, 'transparent', '#EF4444')}>
        ⚠  EMERGENCY STOP  —  emergencyStopVoting()
      </button>

      {/* Audit Log */}
      <div style={S(744, 206, 206, 302, '#1B2A3B')} />
      <div style={T(748, 211, 192, 33, '#FFFFFF', 17, 'left', true)}>Audit Log</div>
      {audit.slice(0, 4).map((log, i) => (
        <div key={log._id || i}>
          <div style={S(748, 251 + i * 62, 192, 55, '#162032')} />
          <div style={T(751, 254 + i * 62, 52, 21, '#00D4AA', 11, 'left', true)}>{timeStr(log.createdAt)}</div>
          <div style={T(751, 273 + i * 62, 182, 19, '#FFFFFF', 13)}>{log.action}</div>
          <div style={T(751, 289 + i * 62, 182, 16, '#94A3B8', 11)}>{log.actor || 'Admin'}</div>
        </div>
      ))}

      {/* New Election Modal */}
      {showNewElection && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1B2A3B', border: '1px solid #00D4AA', borderRadius: 8, padding: 28, width: 360 }}>
            <div style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Initialize New Election</div>
            {[['Election Title', 'title', 'text'], ['Description', 'description', 'text'], ['Start Time', 'startTime', 'datetime-local'], ['End Time', 'endTime', 'datetime-local']].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>{label}</div>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '6px 10px', background: '#162032', border: '1px solid #334155', color: '#FFF', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleCreate} disabled={saving}
                style={{ flex: 1, padding: '8px 0', background: '#00D4AA', color: '#000', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>
                {saving ? 'Creating...' : '🚀 Initialize on Blockchain'}
              </button>
              <button onClick={() => setShowNewElection(false)}
                style={{ padding: '8px 16px', background: '#334155', color: '#FFF', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={T(0, 523, 960, 17, '#94A3B8', 11, 'center')}>Admin Dashboard — Main View</div>
    </div>
  );
}
