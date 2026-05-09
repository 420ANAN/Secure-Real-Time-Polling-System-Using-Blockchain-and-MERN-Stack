import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/voter-auth';

// ── Input Field ──────────────────────────────────────────────────────────────
function Field({ label, id, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label htmlFor={id} style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '13px 16px',
          background: '#0D1B2A',
          border: `1px solid ${focused ? '#10B981' : '#1E3048'}`,
          borderRadius: 10, color: '#F1F5F9', fontSize: 15,
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
      />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function VoterAuth({ onSuccess }) {
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const reset = () => { setError(''); setSuccess(''); };

  const switchMode = (m) => { setMode(m); setName(''); setEmail(''); setPass(''); setConfirm(''); reset(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();

    if (mode === 'register') {
      if (!name.trim()) return setError('Please enter your name.');
      if (password !== confirm) return setError('Passwords do not match.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password };

      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) return setError(data.message || 'Something went wrong.');

      if (mode === 'register') {
        setShowPopup(true);
      } else {
        onSuccess(data.user); // pass user up to App
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0D1B2A',
      fontFamily: 'Calibri, sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative',
    }}>

      {/* Back link */}
      <Link to="/voter-services" style={{
        position: 'absolute', top: 20, left: 20,
        color: '#475569', textDecoration: 'none', fontSize: 13,
        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
        transition: 'color 0.2s', zIndex: 10,
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
        onMouseLeave={e => e.currentTarget.style.color = '#475569'}
      >
        ← <span className="hidden sm:inline">Voter Services</span>
      </Link>

      {/* Logo / branding */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, margin: '0 auto 16px',
          boxShadow: '0 0 30px rgba(16,185,129,0.3)',
        }}>🗳️</div>
        <div style={{ color: '#10B981', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>BlockVote</div>
        <h1 style={{ color: '#F1F5F9', fontSize: 28, fontWeight: 800, margin: '8px 0 4px' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
          {mode === 'login' ? 'Sign in to access the Voter Portal' : 'Register to participate in elections'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#1B2A3B', borderRadius: 16,
        border: '1px solid #1E3048',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        padding: '36px 40px', width: '100%', maxWidth: 420,
      }}>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: '#0D1B2A',
          borderRadius: 10, padding: 4, marginBottom: 28,
          border: '1px solid #1E3048',
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '9px 0',
              background: mode === m ? '#10B981' : 'transparent',
              color: mode === m ? '#0D1B2A' : '#475569',
              border: 'none', borderRadius: 8, fontWeight: 700,
              fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}>
              {m === 'login' ? '🔑 Sign In' : '📝 Register'}
            </button>
          ))}
        </div>

        {/* Success message */}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            color: '#10B981', fontSize: 13, fontWeight: 600,
          }}>✅ {success}</div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            color: '#EF4444', fontSize: 13, fontWeight: 600,
          }}>❌ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Field label="Full Name" id="name" value={name} onChange={setName} placeholder="Enter your full name" />
          )}
          <Field label="Email Address" id="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Password" id="password" type="password" value={password} onChange={setPass} placeholder="Min. 6 characters" />
          {mode === 'register' && (
            <Field label="Confirm Password" id="confirm" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter password" />
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? '#334155' : 'linear-gradient(135deg, #10B981, #059669)',
            color: loading ? '#94A3B8' : '#0D1B2A',
            border: 'none', borderRadius: 10, fontWeight: 800,
            fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8, transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(16,185,129,0.3)',
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: 13, marginTop: 24, marginBottom: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            style={{ color: '#10B981', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </span>
        </p>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(13, 27, 42, 0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: '#1B2A3B', border: '1px solid #10B981', borderRadius: 20,
            padding: '40px 30px', width: '100%', maxWidth: 360, textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', animation: 'scaleUp 0.3s ease'
          }}>
            <div style={{
              width: 80, height: 80, background: 'rgba(16,185,129,0.1)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 40, margin: '0 auto 24px',
              color: '#10B981', border: '1px solid #10B981'
            }}>✅</div>
            <h2 style={{ color: '#F1F5F9', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Success!</h2>
            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
              Your account has been created successfully. You can now log in to the Voter Portal.
            </p>
            <button
              onClick={() => { setShowPopup(false); switchMode('login'); }}
              style={{
                width: '100%', padding: '14px', background: '#10B981',
                color: '#0D1B2A', border: 'none', borderRadius: 10,
                fontWeight: 800, fontSize: 16, cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(16,185,129,0.2)'
              }}
            >
              Go to Login Page
            </button>
          </div>
        </div>
      )}

      {/* Security note */}
      <p style={{ color: '#1E3048', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        🔒 Your credentials are stored securely. Passwords are hashed server-side.
      </p>

      <style>{`
        * { box-sizing: border-box; } 
        input::placeholder { color: #334155; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
