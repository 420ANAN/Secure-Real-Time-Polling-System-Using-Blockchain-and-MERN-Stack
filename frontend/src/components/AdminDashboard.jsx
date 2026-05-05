import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';

const S = (x, y, w, h, bg) => ({ position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: bg });
const T = (x, y, w, h, c, f, a = 'left', b = false) => ({ position: 'absolute', left: x, top: y, width: w, height: h, color: c, fontSize: f, textAlign: a, fontWeight: b ? 'bold' : 'normal', display: 'flex', alignItems: 'center', justifyContent: a === 'center' ? 'center' : a === 'right' ? 'flex-end' : 'flex-start' });
const BTN = (x, y, w, h, bg, c) => ({ position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: bg, color: c, border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalElections: 0, activeElections: 0, totalVotes: 0, totalVoters: 0, elections: [], recentApplications: [] });
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
      setToast('Offline');
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await adminAPI.createElection(form);
      setShowNewElection(false);
      setForm({ title: '', description: '', startTime: '', endTime: '' });
      load();
    } catch (e) { }
    setSaving(false);
  };

  const handleEmergencyStop = async () => {
    if (!window.confirm('⚠ EMERGENCY STOP?')) return;
    try {
      for (const e of stats.elections.filter(e => e.status === 'ACTIVE')) {
        await adminAPI.emergencyStop(e._id, true);
      }
      load();
    } catch (e) { }
  };

  const handleVerify = async (id, status) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/verify-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, status })
      });
      if (res.ok) load();
    } catch (e) { }
  };

  const statusColor = { ACTIVE: '#10B981', DRAFT: '#F59E0B', CLOSED: '#94A3B8' };

  return (
    <div style={{ width: 960, height: 540, position: 'relative', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={S(0, 0, 960, 67, '#1B2A3B')} />
      <div style={S(0, 0, 960, 3, '#EF4444')} />
      <Link to="/" style={{ ...T(20, 3, 140, 59, '#94A3B8', 12, 'left', true), textDecoration: 'none' }}>← RETURN HOME</Link>
      <div style={T(210, 3, 440, 59, '#FFFFFF', 22, 'left', true)}>BlockVote Admin Dashboard</div>

      {/* Sidebar */}
      <div style={S(0, 67, 172, 475, '#1B2A3B')} />
      {['Dashboard', 'Elections', 'Voters', 'Candidates', 'Results'].map((label, i) => (
        <div key={label}>
          {label === 'Dashboard' && <div style={S(0, 72 + i * 57, 172, 48, '#EF4444')} />}
          <div style={T(20, 72 + i * 57, 152, 48, label === 'Dashboard' ? '#FFF' : '#94A3B8', 15)}>{label}</div>
        </div>
      ))}

      {/* Stats */}
      {[
        { x: 187, color: '#00D4AA', val: stats.totalElections, lbl: 'Elections' },
        { x: 379, color: '#0EA5E9', val: stats.totalVoters, lbl: 'Verified Voters' },
        { x: 571, color: '#10B981', val: stats.totalVotes, lbl: 'Votes Cast' },
        { x: 763, color: '#F59E0B', val: 'MANUAL', lbl: 'Mode' },
      ].map((c, i) => (
        <div key={i}>
          <div style={S(c.x, 81, 177, 90, '#1B2A3B')} />
          <div style={T(c.x + 12, 90, 158, 40, c.color, 28, 'left', true)}>{c.val}</div>
          <div style={T(c.x + 12, 130, 158, 20, '#94A3B8', 12)}>{c.lbl}</div>
        </div>
      ))}

      {/* Elections Table */}
      <div style={S(182, 186, 547, 190, '#1B2A3B')} />
      <div style={T(197, 196, 200, 30, '#FFF', 16, 'left', true)}>Active Elections</div>
      <button onClick={() => setShowNewElection(true)} style={BTN(580, 196, 134, 26, '#00D4AA', '#000')}>+ New Election</button>
      
      <div style={{ position: 'absolute', left: 197, top: 235, width: 517, height: 130, overflowY: 'auto' }}>
        <table style={{ width: '100%', color: '#FFF', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', color: '#00D4AA' }}><th>TITLE</th><th>STATUS</th><th>VOTES</th></tr></thead>
          <tbody>
            {stats.elections.map(e => (
              <tr key={e._id} style={{ borderBottom: '1px solid #162032' }}><td style={{ padding: '8px 0' }}>{e.title}</td><td style={{ color: statusColor[e.status] }}>{e.status}</td><td>{e.totalVotes}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Verification Table */}
      <div style={S(182, 386, 547, 140, '#1B2A3B')} />
      <div style={T(197, 396, 200, 20, '#FFF', 14, 'left', true)}>Pending Voter Approvals</div>
      <div style={{ position: 'absolute', left: 197, top: 425, width: 517, height: 90, overflowY: 'auto' }}>
        <table style={{ width: '100%', color: '#FFF', fontSize: 11, borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', color: '#94A3B8' }}><th>NAME</th><th>WALLET</th><th>STATUS</th><th>ACTION</th></tr></thead>
          <tbody>
            {stats.recentApplications?.map(app => (
              <tr key={app._id} style={{ borderBottom: '1px solid #162032' }}>
                <td style={{ padding: '6px 0' }}>{app.fullName}</td>
                <td style={{ color: '#94A3B8', fontFamily: 'monospace' }}>{app.walletAddress ? `${app.walletAddress.slice(0,6)}...${app.walletAddress.slice(-4)}` : 'No Wallet'}</td>
                <td style={{ color: app.status === 'APPROVED' ? '#10B981' : app.status === 'PENDING' ? '#F59E0B' : '#EF4444' }}>{app.status}</td>
                <td>
                   {app.status === 'PENDING' && (
                     <div style={{ display: 'flex', gap: 8 }}>
                       <button onClick={() => handleVerify(app._id, 'APPROVED')} style={{ background: '#10B981', color: '#000', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                       <button onClick={() => handleVerify(app._id, 'REJECTED')} style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                     </div>
                   )}
                   {app.status !== 'PENDING' && <span style={{ color: '#475569' }}>Completed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Log */}
      <div style={S(744, 186, 206, 340, '#1B2A3B')} />
      <div style={T(754, 196, 180, 20, '#FFF', 16, 'left', true)}>Audit Log</div>
      <div style={{ position: 'absolute', left: 754, top: 235, width: 186, height: 280, overflowY: 'auto' }}>
        {audit.map(log => (
          <div key={log._id} style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12, borderBottom: '1px solid #162032', paddingBottom: 6 }}>
            <div style={{ color: '#0EA5E9' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
            <div>{log.action}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showNewElection && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1B2A3B', padding: 24, borderRadius: 8, width: 300, border: '1px solid #00D4AA' }}>
            <div style={{ color: '#FFF', marginBottom: 16 }}>New Election</div>
            <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: 8, marginBottom: 12, background: '#162032', border: '1px solid #334155', color: '#FFF' }} />
            <button onClick={handleCreate} style={{ width: '100%', padding: 10, background: '#00D4AA', color: '#000', border: 'none', borderRadius: 4 }}>Initialize</button>
            <button onClick={() => setShowNewElection(false)} style={{ width: '100%', padding: 10, marginTop: 8, background: 'transparent', color: '#FFF', border: 'none' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Emergency Stop */}
      <button onClick={handleEmergencyStop} style={BTN(780, 20, 150, 30, '#3B0A0A', '#EF4444')}>EMERGENCY STOP</button>

    </div>
  );
}
