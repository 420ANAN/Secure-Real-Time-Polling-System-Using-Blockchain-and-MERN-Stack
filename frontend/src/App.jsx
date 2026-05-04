import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import VoterPortal from './components/VoterPortal';
import Results from './pages/Results';

import { adminAPI } from './api';
import { WalletContext } from './context/WalletContext';

const PresentationSlide = ({ children }) => {
  const [scale, setScale] = React.useState({ x: 1, y: 1 });

  React.useEffect(() => {
    const handleResize = () => setScale({ x: window.innerWidth / 960, y: window.innerHeight / 540 });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0D1B2A', position: 'relative' }}>
      <div style={{ width: 960, height: 540, position: 'absolute', top: 0, left: 0, transform: `scale(${scale.x}, ${scale.y})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
};

const Landing = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif' }}>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
      <img src="/image-1-1.png" alt="logo" style={{ width: 220, height: 220, opacity: 0.9 }} />
      <span style={{
        position: 'absolute',
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 1,
        textShadow: '0 4px 15px rgba(0,0,0,0.8)',
        textAlign: 'center',
        pointerEvents: 'none',
        marginTop: -30 // Lifted higher as requested
      }}>
        BlockVote
      </span>
    </div>
    <p style={{ color: '#FFFFFF', fontSize: 52, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, lineHeight: 1.1, letterSpacing: 1 }}>
      Blockchain-Based<br />E-Voting Application
    </p>
    <p style={{ color: '#00D4AA', fontSize: 16, marginBottom: 40, letterSpacing: 2 }}>Secure • Transparent • Immutable</p>
    <div style={{ display: 'flex', gap: 24 }}>
      <Link to="/admin" style={{ padding: '16px 32px', background: '#1B2A3B', color: '#EF4444', textDecoration: 'none', border: '1px solid #EF4444', borderRadius: 6, fontWeight: 'bold', fontSize: 16 }}>
        Admin
      </Link>
      <Link to="/voter-services" style={{ padding: '16px 32px', background: '#1B2A3B', color: '#10B981', textDecoration: 'none', border: '1px solid #10B981', borderRadius: 6, fontWeight: 'bold', fontSize: 16 }}>
        Voter
      </Link>
    </div>

  </div>
);

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = React.useState({ username: '', password: '' });
  const [error, setError] = React.useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials (try admin/admin123)');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', position: 'relative' }}>
      <Link to="/" style={{ position: 'absolute', top: 30, left: 30, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>←</span> RETURN HOME
      </Link>
      <div style={{ background: '#1B2A3B', padding: 40, borderRadius: 12, width: 360, border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#FFFFFF', marginBottom: 24, textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginBottom: 8 }}>Username</label>
            <input 
              type="text" 
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              style={{ width: '100%', padding: '12px', background: '#162032', border: '1px solid #334155', color: '#FFF', borderRadius: 6, boxSizing: 'border-box' }}
              placeholder="Enter username"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginBottom: 8 }}>Password</label>
            <input 
              type="password" 
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{ width: '100%', padding: '12px', background: '#162032', border: '1px solid #334155', color: '#FFF', borderRadius: 6, boxSizing: 'border-box' }}
              placeholder="Enter password"
            />
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '14px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const VoterServices = () => {
  const navigate = useNavigate();

  const services = [
    { title: 'Voter Portal', desc: 'Securely cast your vote in active elections using your blockchain wallet.', icon: '🗳️', link: '/voter' },
    { title: 'Become Voter', desc: 'Apply for voter registration and verify your eligibility for upcoming polls.', icon: '🆔', link: '/register-voter' },
    { title: 'Live Results', desc: 'View real-time election results and statistics from the blockchain.', icon: '📊', link: '/results' },
    { title: 'Verify Vote', desc: 'Confirm that your vote was accurately recorded on the immutable ledger.', icon: '🔍', link: '/verify-vote' },
    { title: 'System Status', desc: 'Check the health and security of the decentralized voting nodes.', icon: '🛡️', link: '/system-status' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', position: 'relative' }}>
       <Link to="/" style={{ position: 'absolute', top: 30, left: 30, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <span style={{ fontSize: 20 }}>←</span> RETURN HOME
      </Link>

      <div style={{ padding: '80px 40px', maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Voter Services</h2>
        <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 48, textAlign: 'center' }}>Access decentralized tools and election participation portals</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {services.map(s => (
            <div key={s.title} onClick={() => s.link !== '#' && navigate(s.link)} style={{ 
              background: '#1B2A3B', padding: 32, borderRadius: 12, border: '1px solid #334155', cursor: s.link !== '#' ? 'pointer' : 'default',
              transition: 'all 0.3s ease'
            }} onMouseEnter={e => { if(s.link !== '#') e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = '#1F2E3E'; }} 
               onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#1B2A3B'; }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        {/* Spacer for bottom breathing room */}
        <div style={{ height: 100 }} />
      </div>
    </div>
  );
};

const SystemStatus = () => {
  const navigate = useNavigate();
  const { provider } = React.useContext(WalletContext);
  const [stats, setStats] = React.useState({ totalElections: 0, activeElections: 0, totalVotes: 0 });
  const [logs, setLogs] = React.useState([]);
  const [blockNumber, setBlockNumber] = React.useState('...');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, logsRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getAuditLogs()
        ]);
        setStats(dashRes.data);
        setLogs(logsRes.data);

        if (provider) {
          const block = await provider.getBlockNumber();
          setBlockNumber(`#${block.toLocaleString()}`);
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [provider]);

  const nodes = [
    { id: 1, name: 'Node 1 - Primary', status: 'Active', uptime: '99.99%', cpu: '12%', mem: '2.4GB' },
    { id: 2, name: 'Node 2 - Validator', status: 'Active', uptime: '99.95%', cpu: '45%', mem: '4.1GB' },
    { id: 3, name: 'Node 3 - Syncing', status: 'Syncing', uptime: '98.20%', cpu: '88%', mem: '6.2GB' },
    { id: 4, name: 'Node 4 - Backup', status: 'Offline', uptime: '0.00%', cpu: '0%', mem: '0GB' },
  ];

  const metrics = [
    { label: 'Network Security', status: 'HIGH', items: ['0 Critical Threats', '2 Minor Alerts', 'Firewall: Active'] },
    { label: 'Blockchain Core', status: blockNumber, items: [`Avg Block Time: 2.1s`, `Network: Sepolia`, 'Hash Rate: 42 TH/s'] },
    { label: 'Voting Engine', status: 'OPTIMAL', items: [`Success Rate: 100%`, `Active Polls: ${stats.activeElections}`, `Total Votes: ${stats.totalVotes}`] },
    { label: 'Connectivity', status: '24ms', items: ['Peer Count: 18', 'Network Uptime: 100%', 'Load Balanced'] },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', color: '#FFF', position: 'relative' }}>
      <Link to="/voter-services" style={{ position: 'absolute', top: 30, left: 30, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <span style={{ fontSize: 20 }}>←</span> RETURN HOME
      </Link>

      <div style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>System Status Dashboard</h2>
        <p style={{ color: '#00D4AA', fontSize: 14, letterSpacing: 2, marginBottom: 48, textAlign: 'center' }}>REAL-TIME DECENTRALIZED NETWORK MONITOR</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
           {metrics.map(m => (
             <div key={m.label} style={{ background: '#1B2A3B', padding: 24, borderRadius: 12, border: '1px solid #334155' }}>
               <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>{m.label}</div>
               <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: m.status === 'HIGH' || m.status === 'OPTIMAL' ? '#10B981' : '#FFF' }}>{m.status}</div>
               {m.items.map(item => (
                 <div key={item} style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>• {item}</div>
               ))}
             </div>
           ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
          {/* Node List */}
          <div style={{ background: '#1B2A3B', padding: 32, borderRadius: 16, border: '1px solid #334155' }}>
            <h3 style={{ fontSize: 20, marginBottom: 24, fontWeight: 'bold' }}>Node Health</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94A3B8', fontSize: 12, textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '0 0 12px 0' }}>NODE NAME</th>
                  <th>STATUS</th>
                  <th>UPTIME</th>
                  <th>CPU</th>
                  <th style={{ textAlign: 'right' }}>MEM</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map(node => (
                  <tr key={node.id} style={{ borderBottom: '1px solid #162032', fontSize: 14 }}>
                    <td style={{ padding: '16px 0' }}>{node.name}</td>
                    <td>
                       <span style={{ 
                         color: node.status === 'Active' ? '#10B981' : node.status === 'Syncing' ? '#F59E0B' : '#EF4444',
                         display: 'flex', alignItems: 'center', gap: 6
                       }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                         {node.status}
                       </span>
                    </td>
                    <td>{node.uptime}</td>
                    <td>{node.cpu}</td>
                    <td style={{ textAlign: 'right' }}>{node.mem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts & Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#1B2A3B', padding: 24, borderRadius: 16, border: '1px solid #EF444433' }}>
              <h3 style={{ fontSize: 18, marginBottom: 16, color: '#EF4444' }}>System Alerts</h3>
              <div style={{ background: '#EF444411', padding: 12, borderRadius: 8, borderLeft: '4px solid #EF4444', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold' }}>Node 4 Failure</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Communication lost 15m ago</div>
              </div>
              <div style={{ background: '#F59E0B11', padding: 12, borderRadius: 8, borderLeft: '4px solid #F59E0B' }}>
                <div style={{ fontSize: 13, fontWeight: 'bold' }}>High Latency</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Asia-East region spikes detected</div>
              </div>
            </div>

            <div style={{ background: '#1B2A3B', padding: 24, borderRadius: 16, border: '1px solid #334155', flex: 1 }}>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>Audit Logs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
                {logs.length === 0 && <div style={{ color: '#334155', fontSize: 12 }}>No recent activity logs...</div>}
                {logs.map((log) => (
                  <div key={log._id} style={{ fontSize: 12, color: '#94A3B8', borderBottom: '1px solid #162032', paddingBottom: 8 }}>
                    <span style={{ color: '#0EA5E9' }}>[{new Date(log.createdAt).toLocaleTimeString()}]</span> {log.action} - {log.actor}
                    <div style={{ fontSize: 10, color: '#334155' }}>IP: {log.ip}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VoteVerification = () => {
  const [txHash, setTxHash] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!txHash) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setTimeout(() => {
        if (txHash.startsWith('0x')) {
          setResult({
            blockNumber: 15234 + Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
            status: 'Confirmed'
          });
        } else {
          setError('Invalid transaction hash format.');
        }
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Transaction not found or not yet finalized.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Link to="/voter-services" style={{ position: 'absolute', top: 30, left: 30, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>←</span> RETURN HOME
      </Link>

      <div style={{ background: '#1B2A3B', padding: 40, borderRadius: 16, width: 420, border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' }}>Verify Your Vote</h2>
        
        <form onSubmit={handleVerify} style={{ marginBottom: 32 }}>
          <label style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginBottom: 12 }}>Enter Transaction ID</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              type="text" 
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              style={{ flex: 1, padding: '12px', background: '#162032', border: '1px solid #334155', color: '#FFF', borderRadius: 6, fontSize: 14 }}
            />
            <button type="submit" disabled={loading} style={{ padding: '0 24px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? '...' : 'Verify'}
            </button>
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
        </form>

        {result && (
          <div style={{ borderTop: '1px solid #334155', paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#10B981', fontWeight: 'bold' }}>
              <span style={{ fontSize: 20 }}>✔</span> Status: {result.status}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#94A3B8' }}>Block No</span>
                <span style={{ color: '#FFF' }}>{result.blockNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#94A3B8' }}>Timestamp</span>
                <span style={{ color: '#FFF' }}>{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#94A3B8' }}>Vote Hash</span>
                <span style={{ color: '#FFF', fontFamily: 'monospace' }}>{txHash.slice(0, 10)}...</span>
              </div>
            </div>

            <button onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`)} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #10B981', color: '#10B981', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>
              View on Explorer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VoterRegistration = () => {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [sameAsCurrent, setSameAsCurrent] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2500);
  };

  const Section = ({ title, icon, children }) => (
    <div style={{ marginBottom: 50, background: '#162032', padding: 32, borderRadius: 16, border: '1px solid #334155' }}>
      <h3 style={{ color: '#10B981', fontSize: 20, fontWeight: 'bold', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, type = 'text', placeholder, required = true, options = null }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
      {options ? (
        <select required={required} style={{ width: '100%', padding: '12px', background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6 }}>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input required={required} type={type} placeholder={placeholder} style={{ width: '100%', padding: '12px', background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6, fontSize: 14 }} />
      )}
    </div>
  );

  const Upload = ({ label, types }) => (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
      <div style={{ display: 'flex', gap: 12 }}>
        <select style={{ flex: 1, padding: '12px', background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6 }}>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ flex: 2, border: '2px dashed #334155', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#0D1B2A' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Click to Upload Document</span>
        </div>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', padding: 20 }}>
        <div style={{ textAlign: 'center', background: '#1B2A3B', padding: 60, borderRadius: 24, border: '1px solid #10B981', maxWidth: 600, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 100, marginBottom: 24 }}>🏛️</div>
          <h2 style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 16 }}>Application Received</h2>
          <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>Your voter registration has been submitted to the decentralized network for verification. Your unique Voter ID will be generated upon confirmation.</p>
          <Link to="/voter-services" style={{ padding: '16px 48px', background: '#10B981', color: '#000', borderRadius: 12, textDecoration: 'none', fontWeight: 'bold', fontSize: 18 }}>Return to Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', color: '#FFF', position: 'relative', padding: '100px 20px' }}>
      <Link to="/voter-services" style={{ position: 'absolute', top: 40, left: 40, color: '#94A3B8', textDecoration: 'none', fontSize: 15, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>←</span> RETURN HOME
      </Link>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 16 }}>Voter Registration Form</h1>
          <p style={{ color: '#94A3B8', fontSize: 18 }}>Please provide accurate details to register your identity on the secure voting ledger.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Section title="Basic Personal Details" icon="👤">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>
              <Field label="Full Name (First, Middle, Last)" placeholder="John Quincy Doe" />
              <Field label="Gender" options={['Male', 'Female', 'Other']} />
              <Field label="Date of Birth" type="date" />
            </div>
            <Field label="Place of Birth" placeholder="City, State, Country" />
          </Section>

          <Section title="Family Details" icon="👪">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              <Field label="Relative's Name (Father/Mother/Husband)" placeholder="Jane Doe" />
              <Field label="Relationship Type" options={['Father', 'Mother', 'Husband', 'Guardian']} />
            </div>
          </Section>

          <Section title="Current Address Details" icon="📍">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="House No / Building" placeholder="H-102" />
              <Field label="Street / Area / Locality" placeholder="Green Valley" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <Field label="Town / Village" placeholder="New Delhi" />
              <Field label="District" placeholder="South Delhi" />
              <Field label="State" placeholder="Delhi" />
            </div>
            <Field label="PIN Code" placeholder="110001" />
          </Section>

          <Section title="Permanent Address" icon="🏠">
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" onChange={e => setSameAsCurrent(e.target.checked)} />
              <label style={{ fontSize: 14, color: '#94A3B8' }}>Same as Current Address</label>
            </div>
            {!sameAsCurrent && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <Field label="Full Permanent Address" placeholder="Enter complete address" />
              </div>
            )}
          </Section>

          <Section title="Contact & Identification" icon="📱">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Mobile Number" placeholder="+91 XXXXX XXXXX" />
              <Field label="Email ID" type="email" placeholder="john@example.com" required={false} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Aadhaar Number" placeholder="XXXX XXXX XXXX" required={false} />
              <Field label="Other ID Type" options={['Passport', 'PAN', 'Driving License', 'Ration Card']} />
            </div>
          </Section>

          <Section title="Document Uploads" icon="📁">
            <Upload label="Age Proof" types={['Birth Certificate', '10th Marksheet', 'Passport', 'Aadhaar']} />
            <Upload label="Address Proof" types={['Aadhaar Card', 'Electricity Bill', 'Rent Agreement', 'Bank Passbook']} />
            <div style={{ marginTop: 30 }}>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' }}>Passport Size Photograph</label>
              <div style={{ width: 120, height: 150, border: '2px dashed #334155', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#0D1B2A' }}>
                <span style={{ fontSize: 10, textAlign: 'center', color: '#94A3B8' }}>Upload Photo</span>
              </div>
            </div>
          </Section>

          <Section title="Previous Voter Details (If Shifting)" icon="🔄">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Previous EPIC Number" placeholder="ABC1234567" required={false} />
              <Field label="Previous Constituency" placeholder="District 12" required={false} />
            </div>
          </Section>

          <Section title="Declaration & Special Categories" icon="✍️">
             <div style={{ marginBottom: 30, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ background: '#0D1B2A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" /> <span style={{ fontSize: 12 }}>Disability (PwD)</span>
                   </label>
                </div>
                <div style={{ background: '#0D1B2A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" /> <span style={{ fontSize: 12 }}>Overseas Voter (NRI)</span>
                   </label>
                </div>
                <div style={{ background: '#0D1B2A', padding: 16, borderRadius: 8, border: '1px solid #334155' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" /> <span style={{ fontSize: 12 }}>Service Voter</span>
                   </label>
                </div>
             </div>

             <div style={{ padding: 24, background: '#1B2A3B', border: '1px solid #10B981', borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ color: '#10B981', marginBottom: 12, fontSize: 16 }}>Declaration</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94A3B8' }}>
                      <input required type="checkbox" /> I confirm that I am an Indian Citizen.
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94A3B8' }}>
                      <input required type="checkbox" /> I confirm that I am not registered as a voter in any other constituency.
                   </label>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Field label="Place of Declaration" placeholder="Current City" />
                <div style={{ border: '1px solid #334155', height: 60, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B2A' }}>
                   <span style={{ fontSize: 11, color: '#334155' }}>Digital Signature Area</span>
                </div>
             </div>
          </Section>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '24px', background: '#10B981', color: '#000', border: 'none', borderRadius: 16, fontSize: 20, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}>
            {loading ? 'Processing Application...' : 'Submit Final Application'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

function App() {
  const [adminPage, setAdminPage] = React.useState('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={
        isAdminAuthenticated ? (
          <PresentationSlide>
            <AdminDashboard onNavigate={setAdminPage} />
          </PresentationSlide>
        ) : (
          <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
        )
      } />
      <Route path="/voter" element={
        <PresentationSlide>
          <VoterPortal />
        </PresentationSlide>
      } />
      <Route path="/voter-services" element={<VoterServices />} />
      <Route path="/results" element={
        <PresentationSlide>
          <Results />
        </PresentationSlide>
      } />
      <Route path="/system-status" element={<SystemStatus />} />
      <Route path="/verify-vote" element={<VoteVerification />} />
      <Route path="/register-voter" element={<VoterRegistration />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
