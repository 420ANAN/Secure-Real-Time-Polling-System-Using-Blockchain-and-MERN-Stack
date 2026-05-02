import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import VoterPortal from './components/VoterPortal';

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

const Login = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <img src="/image-1-1.png" alt="logo" style={{ width: 48, height: 48 }} />
      <span style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', letterSpacing: 1 }}>BlockVote</span>
    </div>
    <p style={{ color: '#00D4AA', fontSize: 14, marginBottom: 40, letterSpacing: 2 }}>Secure • Transparent • Immutable</p>
    <div style={{ display: 'flex', gap: 24 }}>
      <Link to="/admin" style={{ padding: '16px 32px', background: '#1B2A3B', color: '#EF4444', textDecoration: 'none', border: '1px solid #EF4444', borderRadius: 6, fontWeight: 'bold', fontSize: 16 }}>
        🔐 Admin Dashboard
      </Link>
      <Link to="/voter" style={{ padding: '16px 32px', background: '#1B2A3B', color: '#10B981', textDecoration: 'none', border: '1px solid #10B981', borderRadius: 6, fontWeight: 'bold', fontSize: 16 }}>
        🗳 Voter Portal
      </Link>
    </div>
    <p style={{ color: '#334155', fontSize: 11, marginTop: 32 }}>UI Architecture • Admin Dashboard • Voter Portal</p>
  </div>
);

function App() {
  const [adminPage, setAdminPage] = useState('dashboard');

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={
        <PresentationSlide>
          <AdminDashboard onNavigate={setAdminPage} />
        </PresentationSlide>
      } />
      <Route path="/voter" element={
        <PresentationSlide>
          <VoterPortal />
        </PresentationSlide>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
