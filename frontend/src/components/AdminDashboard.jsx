import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';
import API_BASE_URL from '../apiConfig';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalElections: 0, activeElections: 0, totalVotes: 0, totalVoters: 0, elections: [], recentApplications: [] });
  const [audit, setAudit] = useState([]);
  const [showNewElection, setShowNewElection] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const load = async () => {
    try {
      const [d, a] = await Promise.all([adminAPI.getDashboard(), adminAPI.getAuditLogs()]);
      setStats(d.data);
      setAudit(a.data.slice(0, 4));
    } catch (e) {
      console.error('Offline');
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
      const res = await fetch(`${API_BASE_URL}/admin/verify-voter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, status })
      });
      if (res.ok) load();
    } catch (e) { }
  };

  const statusColor = { ACTIVE: '#10B981', DRAFT: '#F59E0B', CLOSED: '#94A3B8' };

  const menuItems = [
    { label: 'Dashboard', path: '/admin', active: true },
    { label: 'Elections', path: '/admin/elections' },
    { label: 'Candidates', path: '/admin/candidates' },
    { label: 'Results', path: '/results' },
    { label: 'Voters', path: '#' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0D1B2A] text-white font-sans overflow-x-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1B2A3B] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out border-r border-slate-800`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
             <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center font-bold text-white">V</div>
             <span className="text-xl font-bold tracking-tight">VoteSecure</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <Link 
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${item.active ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Link to="/" className="flex items-center px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
               ← Return Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-[#1B2A3B] border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg lg:text-xl font-bold truncate">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleEmergencyStop}
              className="bg-red-950/50 text-red-500 border border-red-500/30 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-900 transition-colors hidden sm:block"
            >
              EMERGENCY STOP
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 space-y-8 overflow-y-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Elections', value: stats.totalElections, color: 'text-emerald-400', bg: 'bg-[#1B2A3B]' },
              { label: 'Verified Voters', value: stats.totalVoters, color: 'text-sky-400', bg: 'bg-[#1B2A3B]' },
              { label: 'Votes Cast', value: stats.totalVotes, color: 'text-emerald-500', bg: 'bg-[#1B2A3B]' },
              { label: 'System Mode', value: 'MANUAL', color: 'text-amber-500', bg: 'bg-[#1B2A3B]' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} p-6 rounded-xl border border-slate-800 shadow-lg`}>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Active Elections Table */}
            <div className="xl:col-span-2 bg-[#1B2A3B] rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-lg font-bold">Active Elections</h3>
                <button 
                  onClick={() => setShowNewElection(true)}
                  className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors"
                >
                  + New Election
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-emerald-400 text-xs font-bold uppercase border-b border-slate-800/50">
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Votes</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats.elections.length === 0 ? (
                       <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No elections found</td></tr>
                    ) : stats.elections.map(e => (
                      <tr key={e._id} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{e.title}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor[e.status] }}></span>
                            <span style={{ color: statusColor[e.status] }} className="font-bold text-xs uppercase">{e.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">{e.totalVotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-[#1B2A3B] rounded-xl border border-slate-800 shadow-lg flex flex-col">
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold">Recent Activity</h3>
              </div>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[400px]">
                {audit.length === 0 ? (
                  <div className="text-slate-500 text-center py-8 text-sm">No activity logs</div>
                ) : audit.map(log => (
                  <div key={log._id} className="border-l-2 border-sky-500 pl-4 py-1">
                    <div className="text-sky-400 text-xs font-bold mb-1">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    <div className="text-slate-300 text-sm leading-relaxed">{log.action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voter Approvals */}
            <div className="xl:col-span-3 bg-[#1B2A3B] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold">Pending Voter Approvals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase border-b border-slate-800/50">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Wallet</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats.recentApplications?.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No pending approvals</td></tr>
                    ) : stats.recentApplications?.map(app => (
                      <tr key={app._id} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{app.fullName}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">
                          {app.walletAddress ? `${app.walletAddress.slice(0,6)}...${app.walletAddress.slice(-4)}` : 'No Wallet'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 
                            app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {app.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleVerify(app._id, 'APPROVED')} className="bg-emerald-500 text-black px-3 py-1 rounded text-xs font-bold hover:bg-emerald-400">Approve</button>
                              <button onClick={() => handleVerify(app._id, 'REJECTED')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-400">Reject</button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* New Election Modal */}
      {showNewElection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1B2A3B] p-8 rounded-2xl w-full max-w-md border border-emerald-500/30 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Initialize New Election</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Election Title</label>
                <input 
                  placeholder="e.g. Presidential Election 2026" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  className="w-full p-3 bg-[#0D1B2A] border border-slate-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button onClick={handleCreate} className="w-full bg-emerald-500 text-black p-4 rounded-xl font-bold text-lg hover:bg-emerald-400 shadow-lg shadow-emerald-500/20">Create Election Node</button>
                <button onClick={() => setShowNewElection(false)} className="w-full bg-transparent text-slate-400 p-2 rounded-xl font-medium hover:text-white">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

    </div>
  );
}
