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

const VoterCard = ({ card }) => (
  <div style={{ perspective: '1000px' }}>
    <div id="voter-card-print-area" style={{ width: 500, height: 300, background: 'linear-gradient(135deg, #1B2A3B 0%, #0D1B2A 100%)', borderRadius: 20, border: '2px solid #10B981', padding: 24, position: 'relative', overflow: 'hidden', color: '#FFF', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', right: -40, bottom: -40, fontSize: 200, opacity: 0.1, transform: 'rotate(-20deg)' }}>🇮🇳</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏛️</div>
          <div><div style={{ fontSize: 14, fontWeight: 'bold' }}>ELECTION COMMISSION</div><div style={{ fontSize: 10, color: '#10B981' }}>SECURE BLOCKCHAIN</div></div>
        </div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#94A3B8' }}>EPIC NO.</div><div style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>{card.epicNumber}</div></div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <img src={card.photo} alt="P" style={{ width: 100, height: 120, borderRadius: 8, objectFit: 'cover' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div><label style={{ fontSize: 9, color: '#94A3B8' }}>NAME</label><div style={{ fontSize: 16, fontWeight: 'bold' }}>{card.fullName}</div></div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div><label style={{ fontSize: 9, color: '#94A3B8' }}>GENDER</label><div>{card.gender}</div></div>
            <div><label style={{ fontSize: 9, color: '#94A3B8' }}>DOB</label><div>{new Date(card.dob).toLocaleDateString()}</div></div>
          </div>
          <div><label style={{ fontSize: 9, color: '#94A3B8' }}>ADDRESS</label><div style={{ fontSize: 10 }}>{card.address}</div></div>
        </div>
      </div>
    </div>
  </div>
);

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
        marginTop: -30
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
    { title: 'Check EPIC Status', desc: 'Check your voter registration status and download your card using your reference ID.', icon: '🔍', link: '/check-status' },
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

const Section = ({ title, icon, children }) => (
  <div style={{ marginBottom: 50, background: '#162032', padding: 32, borderRadius: 16, border: '1px solid #334155' }}>
    <h3 style={{ color: '#10B981', fontSize: 20, fontWeight: 'bold', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 24 }}>{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, path, formData, onChange, type = 'text', placeholder, required = true, options = null }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
    {options ? (
      <select 
        required={required} 
        value={path.split('.').reduce((acc, k) => acc[k], formData)}
        onChange={(e) => onChange(path, e.target.value)}
        style={{ width: '100%', padding: '12px', background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6 }}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        required={required} 
        type={type} 
        placeholder={placeholder} 
        value={path.split('.').reduce((acc, k) => acc[k], formData)}
        onChange={(e) => onChange(path, e.target.value)}
        style={{ width: '100%', padding: '12px', background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6, fontSize: 14 }} 
      />
    )}
  </div>
);

const INDIA_DATA = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger (Monghyr)", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia (Purnea)", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chandigarh (UT)": ["Chandigarh"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", "Gariyaband", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kondagaon", "Korba", "Korea (Koriya)", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Dadra and Nagar Haveli and Daman and Diu (UT)": ["Dadra & Nagar Haveli", "Daman", "Diu"],
  "Delhi (NCT)": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang (Ahwa)", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda (Nadiad)", "Mahisagar", "Mehsana", "Morbi", "Narmada (Rajpipla)", "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram (Gurgaon)", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul & Spiti", "Mandi", "Shimla", "Sirmaur (Sirmour)", "Solan", "Una"],
  "Jammu and Kashmir (UT)": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru (Bangalore) Rural", "Bengaluru (Bangalore) Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru (Chikmagalur)", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Ladakh (UT)": ["Kargil", "Leh"],
  "Lakshadweep (UT)": ["Lakshadweep"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
  "Puducherry (UT)": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Shahid Bhagat Singh Nagar (Nawanshahr)", "Sri Muktsar Sahib", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhoopalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi (Chatrapati Sahuji Mahraj Nagar)", "Amroha (J.P. Nagar)", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur (Panchsheel Nagar)", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj (Kanshiram Nagar)", "Kaushambi", "Kushinagar (Padrauna)", "Lakhimpur - Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal (Bheem Nagar)", "Sant Kabir Nagar", "Shahjahanpur", "Shamli (Prabuddha Nagar)", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
};

const VoterRegistration = () => {
  const [loading, setLoading] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState(null);
  const [errors, setErrors] = React.useState([]);
  const [formData, setFormData] = React.useState({
    fullName: '',
    gender: 'Male',
    dob: '',
    currentAddress: {
      houseNo: '',
      street: '',
      locality: '',
      town: '',
      district: 'Central Delhi',
      state: 'Delhi (NCT)',
      pinCode: ''
    },
    mobileNumber: '',
    email: '',
    aadhaarNumber: '',
    documents: {
      citizenshipProofType: 'Passport',
      citizenshipProofFile: '',
      ageProofType: 'Birth Certificate',
      addressProofType: 'Aadhaar Card',
      photograph: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    walletAddress: ''
  });

  const handleChange = (path, value) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setFormData({ ...formData, [keys[0]]: value });
    } else {
      if (path === 'currentAddress.state') {
        setFormData({
          ...formData,
          currentAddress: {
             ...formData.currentAddress,
             state: value,
             district: INDIA_DATA[value][0]
          }
        });
      } else {
        setFormData({
          ...formData,
          [keys[0]]: { ...formData[keys[0]], [keys[1]]: value }
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      const response = await fetch('http://localhost:5000/api/register-voter/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        setSubmittedData(result);
      } else {
        setErrors(result.errors || [result.message]);
      }
    } catch (err) {
      setErrors(['Could not connect to verification server.']);
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    const isPending = submittedData.status === 'PENDING';
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', padding: 20 }}>
        <div style={{ textAlign: 'center', background: '#1B2A3B', padding: 60, borderRadius: 24, border: `1px solid ${isPending ? '#F59E0B' : '#10B981'}`, maxWidth: 700, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{isPending ? '⏳' : '✅'}</div>
          <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
            {isPending ? 'Application Submitted!' : 'Identity Verified!'}
          </h2>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', margin: '24px 0', border: '1px solid #334155' }}>
            <p style={{ color: '#94A3B8', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reference Number</p>
            <p style={{ color: isPending ? '#F59E0B' : '#10B981', fontSize: 28, fontWeight: '900', fontFamily: 'monospace' }}>
              {submittedData.referenceNumber || 'N/A'}
            </p>
          </div>
          <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 40, lineHeight: '1.6' }}>
            {isPending 
              ? 'Your application has been successfully submitted for review. Please save your reference number. You will be notified once the administrator approves your voter status.'
              : 'The verification agent has successfully confirmed your details. Your digital voter card is ready.'}
          </p>
          {submittedData.voterCard && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
              <VoterCard card={submittedData.voterCard} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {!isPending && (
              <button onClick={() => window.print()} style={{ padding: '16px 36px', background: 'transparent', border: '1px solid #10B981', color: '#10B981', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>
                Download Card
              </button>
            )}
            <Link to="/voter-services" style={{ padding: '16px 36px', background: `linear-gradient(135deg, ${isPending ? '#F59E0B 0%, #D97706 100%' : '#10B981 0%, #059669 100%'})`, color: '#0D1B2A', borderRadius: 10, textDecoration: 'none', fontWeight: '900', boxShadow: `0 8px 20px ${isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
              {isPending ? 'Back to Services' : 'Proceed to Portal'}
            </Link>
          </div>
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
          <p style={{ color: '#94A3B8', fontSize: 18 }}>Please provide accurate details. Our AI Agent will verify your eligibility instantly.</p>
        </div>
        {errors.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: 20, borderRadius: 12, marginBottom: 40 }}>
            <h4 style={{ color: '#EF4444', marginBottom: 10 }}>⚠️ Verification Errors</h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#FDA4AF', fontSize: 14 }}>
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Section title="Basic Personal Details" icon="👤">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>
              <Field label="Full Name" path="fullName" formData={formData} onChange={handleChange} placeholder="John Quincy Doe" />
              <Field label="Gender" path="gender" formData={formData} onChange={handleChange} options={['Male', 'Female', 'Other']} />
              <Field label="Date of Birth" path="dob" formData={formData} onChange={handleChange} type="date" />
            </div>
          </Section>
          <Section title="Current Address Details" icon="📍">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="House No" path="currentAddress.houseNo" formData={formData} onChange={handleChange} placeholder="H-102" />
              <Field label="Street" path="currentAddress.street" formData={formData} onChange={handleChange} placeholder="Green Valley" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <Field label="Town / Village" path="currentAddress.town" formData={formData} onChange={handleChange} placeholder="New Delhi" />
              <Field label="State" path="currentAddress.state" formData={formData} onChange={handleChange} options={Object.keys(INDIA_DATA)} />
              <Field label="District" path="currentAddress.district" formData={formData} onChange={handleChange} options={INDIA_DATA[formData.currentAddress.state] || []} />
            </div>
            <Field label="PIN Code" path="currentAddress.pinCode" formData={formData} onChange={handleChange} placeholder="110001" />
          </Section>
          <Section title="Contact & Identification" icon="📱">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Mobile Number" path="mobileNumber" formData={formData} onChange={handleChange} placeholder="91XXXXXXXXXX" />
              <Field label="Email ID" path="email" formData={formData} onChange={handleChange} type="email" placeholder="john@example.com" />
            </div>
            <Field label="Aadhaar Number" path="aadhaarNumber" formData={formData} onChange={handleChange} placeholder="123456789012" />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Blockchain Wallet Address</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  required 
                  type="text" 
                  placeholder="0x..." 
                  value={formData.walletAddress}
                  onChange={(e) => handleChange('walletAddress', e.target.value)}
                  style={{ flex: 1, padding: '12px', background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6, fontSize: 14, fontFamily: 'monospace' }} 
                />
                <button 
                  type="button"
                  onClick={async () => {
                    if (window.ethereum) {
                      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                      if (accounts[0]) handleChange('walletAddress', accounts[0]);
                    } else {
                      alert('MetaMask not detected');
                    }
                  }}
                  style={{ padding: '0 20px', background: '#1B2A3B', color: '#10B981', border: '1px solid #10B981', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </Section>
          <button type="submit" disabled={loading} style={{ width: '100%', height: '56px', background: loading ? '#334155' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#0D1B2A', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) brightness(0.8) sepia(100%) saturate(10000%) hue-rotate(120deg); cursor: pointer; }
        @media print {
          body * { visibility: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #voter-card-print-area, #voter-card-print-area * { visibility: visible; }
          #voter-card-print-area { position: absolute; left: 50% !important; top: 40% !important; transform: translate(-50%, -50%) scale(1.5) !important; border: 2px solid #10B981 !important; box-shadow: none !important; background: linear-gradient(135deg, #1B2A3B 0%, #0D1B2A 100%) !important; }
          @page { margin: 0; size: landscape; }
        }
      `}</style>
    </div>
  );
};

const CheckStatus = () => {
  const [ref, setRef] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!ref) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`http://localhost:5000/api/register-voter/status/${ref}`);
      const data = await response.json();
      if (response.ok) setResult(data);
      else setError(data.message || 'Application not found.');
    } catch (err) { setError('Could not connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 20 }}>
      <Link to="/voter-services" style={{ position: 'absolute', top: 30, left: 30, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>←</span> RETURN SERVICES
      </Link>
      <div style={{ background: '#1B2A3B', padding: 40, borderRadius: 16, width: result && result.status === 'APPROVED' ? 580 : 420, border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' }}>Check EPIC Status</h2>
        <form onSubmit={handleCheck} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="REF-XXXXXX" style={{ flex: 1, padding: '12px', background: '#162032', border: '1px solid #334155', color: '#FFF', borderRadius: 6 }} />
            <button type="submit" disabled={loading} style={{ padding: '0 24px', background: '#10B981', color: '#0D1B2A', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>{loading ? '...' : 'Track'}</button>
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
        </form>
        {result && (
          <div style={{ borderTop: '1px solid #334155', paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ color: '#94A3B8' }}>Status</span>
              <span style={{ color: result.status === 'APPROVED' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{result.status}</span>
            </div>
            {result.status === 'APPROVED' && result.previousVoter?.epicNumber && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <VoterCard card={{
                  fullName: result.fullName,
                  gender: result.gender,
                  dob: result.dob,
                  epicNumber: result.previousVoter.epicNumber,
                  address: `${result.currentAddress.houseNo}, ${result.currentAddress.town}`,
                  photo: result.documents?.photograph,
                  issueDate: result.verifiedAt || new Date()
                }} />
                <button onClick={() => window.print()} style={{ width: '100%', padding: '14px', background: '#10B981', color: '#0D1B2A', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>Download EPIC</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [adminPage, setAdminPage] = React.useState('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={isAdminAuthenticated ? <PresentationSlide><AdminDashboard onNavigate={setAdminPage} /></PresentationSlide> : <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />} />
      <Route path="/voter" element={<PresentationSlide><VoterPortal /></PresentationSlide>} />
      <Route path="/voter-services" element={<VoterServices />} />
      <Route path="/results" element={<PresentationSlide><Results /></PresentationSlide>} />
      <Route path="/system-status" element={<SystemStatus />} />
      <Route path="/verify-vote" element={<VoteVerification />} />
      <Route path="/register-voter" element={<VoterRegistration />} />
      <Route path="/check-status" element={<CheckStatus />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
