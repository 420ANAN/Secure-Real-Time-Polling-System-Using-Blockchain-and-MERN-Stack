import React, { useState, useEffect } from 'react';
import { voterAPI } from '../api';

const S = (x, y, w, h, bg) => ({ position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: bg, overflow: 'hidden' });
const T = (x, y, w, h, color, size, align = 'left', bold = false) => ({
  position: 'absolute', left: x, top: y, width: w, height: h, color,
  fontSize: size, textAlign: align, fontWeight: bold ? 'bold' : 'normal',
  display: 'flex', alignItems: 'center',
  justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
  paddingLeft: align === 'left' ? 8 : 0, paddingRight: align === 'right' ? 8 : 0,
  userSelect: 'none'
});
const BTN = (x, y, w, h, bg, color, cursor = 'pointer') => ({
  position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: bg, color,
  border: 'none', cursor, fontSize: 13, fontWeight: 'bold',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const WALLET_ADDRESS = '0x4f2A7c3d9E8b1F6a2C5d4E7f8a9B0c1D2e3F4a5';

export default function VoterPortal() {
  const [view, setView] = useState('connect'); // connect | dashboard | ballot | verify
  const [connected, setConnected] = useState(false);
  const [elections, setElections] = useState([]);
  const [stats, setStats] = useState({ available: 0, voted: 0, pending: 0 });
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [receiptHash, setReceiptHash] = useState('');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [toast, setToast] = useState('');
  const [voting, setVoting] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handleConnect = async (type) => {
    if (type === 'metamask') {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          showToast('MetaMask connected!');
        } catch (e) { showToast('MetaMask rejected'); return; }
      } else {
        showToast('MetaMask not installed — using demo address');
      }
    }
    setConnected(true);
    setView('dashboard');
    loadDashboard();
  };

  const loadDashboard = async () => {
    try {
      const [elRes, stRes] = await Promise.all([
        voterAPI.getElections(WALLET_ADDRESS),
        voterAPI.getStats(WALLET_ADDRESS)
      ]);
      setElections(elRes.data);
      setStats(stRes.data);
    } catch {
      setElections([
        { _id: 'e1', title: 'General Election 2025', description: 'Vote for your parliamentary representative', status: 'ACTIVE', isEligible: true, hasVoted: false },
        { _id: 'e2', title: 'Senate By-Election', description: 'Fill the vacant Senate seat for District 4', status: 'ACTIVE', isEligible: true, hasVoted: false },
      ]);
      setStats({ available: 3, voted: 7, pending: 2 });
    }
  };

  const handleVoteClick = async (election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    try {
      const res = await voterAPI.getCandidates(election._id);
      setCandidates(res.data.length ? res.data : [
        { _id: 'c1', name: 'Alexandra Chen', party: 'Progressive Alliance' },
        { _id: 'c2', name: 'Marcus Williams', party: 'Conservative Union' },
        { _id: 'c3', name: 'Priya Sharma', party: 'Independent' },
      ]);
    } catch {
      setCandidates([
        { _id: 'c1', name: 'Alexandra Chen', party: 'Progressive Alliance' },
        { _id: 'c2', name: 'Marcus Williams', party: 'Conservative Union' },
        { _id: 'c3', name: 'Priya Sharma', party: 'Independent' },
      ]);
    }
    setView('ballot');
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) return showToast('Please select a candidate');
    setVoting(true);
    setConfirmModal(false);
    try {
      const res = await voterAPI.castVote({
        electionId: selectedElection._id,
        candidateId: selectedCandidate._id,
        voterAddress: WALLET_ADDRESS
      });
      setReceiptHash(res.data.receiptHash);
      showToast('Vote cast! Your SHA-256 receipt is ready.');
      setView('dashboard');
      loadDashboard();
    } catch (e) {
      showToast(e.response?.data?.message || 'Vote failed');
    }
    setVoting(false);
  };

  const handleVerify = async () => {
    if (!verifyInput.trim()) return showToast('Enter a receipt hash');
    try {
      const res = await voterAPI.verifyReceipt(verifyInput.trim());
      setVerifyResult(res.data);
    } catch (e) {
      setVerifyResult(null);
      showToast(e.response?.data?.message || 'Receipt not found');
    }
  };

  return (
    <div style={{ width: 960, height: 540, position: 'relative', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', overflow: 'hidden' }}>

      {toast && <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', background: '#064E3B', color: '#00D4AA', padding: '8px 20px', borderRadius: 6, zIndex: 200, fontSize: 13, border: '1px solid #00D4AA' }}>{toast}</div>}

      {/* Header */}
      <div style={S(0, 0, 960, 67, '#1B2A3B')} />
      <div style={S(0, 0, 960, 3, '#10B981')} />
      <img src="/image-1-1.png" alt="logo" style={{ position: 'absolute', left: 19, top: 13, width: 30, height: 30 }} />
      <div style={T(59, 3, 440, 59, '#FFFFFF', 22, 'left', true)}>BlockVote Voter Portal</div>
      <div style={T(480, 3, 460, 59, '#94A3B8', 12, 'right')}>
        {connected ? 'Wallet Authentication  →  Dashboard' : 'Wallet Authentication  →  Dashboard'}
      </div>

      {/* NAV TABS when connected */}
      {connected && (
        <div style={{ position: 'absolute', top: 67, left: 400, display: 'flex', gap: 2, height: 14, zIndex: 10 }}>
          {[['Dashboard', 'dashboard'], ['Ballot', 'ballot'], ['Verify', 'verify']].map(([label, v]) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '0 12px', background: view === v ? '#10B981' : '#162032', color: view === v ? '#000' : '#94A3B8', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: view === v ? 'bold' : 'normal' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ===== CONNECT VIEW ===== */}
      {view === 'connect' && (
        <>
          <div style={S(19, 81, 364, 432, '#1B2A3B')} />
          <div style={T(19, 91, 364, 43, '#FFFFFF', 18, 'center', true)}>Connect Your Wallet</div>
          <div style={{ ...T(38, 132, 326, 48, '#94A3B8', 13, 'center'), textAlign: 'center', lineHeight: 1.5 }}>
            Verify your identity to participate<br />in the democratic process
          </div>
          <button onClick={() => handleConnect('metamask')} style={{ ...BTN(52, 192, 297, 55, '#E97B2E', '#FFFFFF'), borderRadius: 2, fontSize: 15 }}>🦊  Connect MetaMask</button>
          <button onClick={() => handleConnect('walletconnect')} style={{ ...BTN(52, 259, 297, 48, '#162032', '#0EA5E9'), borderRadius: 2 }}>🔗  WalletConnect</button>
          <button onClick={() => handleConnect('coinbase')} style={{ ...BTN(52, 318, 297, 48, '#162032', '#94A3B8'), borderRadius: 2 }}>🔷  Coinbase Wallet</button>
          <div style={S(52, 379, 297, 3, '#94A3B8')} />
          <div style={{ ...T(33, 388, 336, 48, '#94A3B8', 11, 'center'), textAlign: 'center', lineHeight: 1.7 }}>
            🔒 Your wallet never shares private keys<br />Role-based access verified on-chain
          </div>
          <div style={S(153, 446, 76, 11, '#10B981')} />

          {/* Right side placeholder */}
          <div style={S(403, 81, 537, 432, '#1B2A3B')} />
          <div style={T(417, 88, 508, 38, '#94A3B8', 18, 'left', true)}>Connect wallet to view dashboard</div>
          <div style={T(417, 124, 508, 26, '#334155', 13)}>Your personalized dashboard will appear here after authentication.</div>
        </>
      )}

      {/* ===== DASHBOARD VIEW ===== */}
      {view === 'dashboard' && (
        <>
          <div style={S(19, 81, 364, 432, '#1B2A3B')} />
          <div style={T(19, 91, 364, 43, '#FFFFFF', 18, 'center', true)}>Connect Your Wallet</div>
          <div style={{ ...T(38, 132, 326, 48, '#94A3B8', 13, 'center'), lineHeight: 1.5 }}>Already connected via MetaMask</div>
          <button style={{ ...BTN(52, 192, 297, 55, '#10B981', '#FFFFFF'), borderRadius: 2, fontSize: 15 }}>✓ Connected</button>
          <button onClick={() => handleConnect('walletconnect')} style={{ ...BTN(52, 259, 297, 48, '#162032', '#0EA5E9'), borderRadius: 2 }}>🔗  WalletConnect</button>
          <div style={S(153, 446, 76, 11, '#10B981')} />

          <div style={S(403, 81, 537, 432, '#1B2A3B')} />
          <div style={T(417, 88, 508, 38, '#FFFFFF', 20, 'left', true)}>Welcome back, Citizen #7821 👋</div>
          <div style={T(417, 124, 508, 26, '#10B981', 12)}>0x4f2A...c81D  |  ✓ Verified Voter  |  {stats.pending} elections pending</div>

          {[
            { x: 417, color: '#10B981', val: stats.available, label: 'Available' },
            { x: 585, color: '#0EA5E9', val: stats.voted, label: 'Voted' },
            { x: 753, color: '#F59E0B', val: stats.pending, label: 'Pending' },
          ].map(c => (
            <div key={c.label}>
              <div style={S(c.x, 161, 153, 81, '#162032')} />
              <div style={T(c.x, 165, 153, 43, c.color, 28, 'center', true)}>{c.val}</div>
              <div style={T(c.x, 206, 153, 24, '#94A3B8', 12, 'center')}>{c.label}</div>
            </div>
          ))}

          <div style={T(417, 251, 384, 28, '#FFFFFF', 16, 'left', true)}>Active Elections</div>

          {elections.slice(0, 2).map((el, i) => {
            const y = 288 + i * 105;
            return (
              <div key={el._id}>
                <div style={S(417, y, 508, 91, '#162032')} />
                <div style={T(432, y + 4, 306, 28, '#FFFFFF', 15, 'left', true)}>{el.title}</div>
                <div style={T(432, y + 31, 306, 21, '#94A3B8', 12)}>{el.description}</div>
                <div style={T(432, y + 52, 144, 21, '#F59E0B', 12)}>⏱ {i === 0 ? '12h' : '2d'} left</div>
                <button
                  onClick={() => handleVoteClick(el)}
                  style={{ ...BTN(748, y + 7, 158, 33, el.hasVoted ? '#334155' : '#10B981', '#FFFFFF'), borderRadius: 2 }}>
                  {el.hasVoted ? '✓ Voted' : 'Cast Your Vote'}
                </button>
                <div style={T(748, y + 48, 158, 19, '#10B981', 11, 'center', true)}>● ELIGIBLE</div>
              </div>
            );
          })}
        </>
      )}

      {/* ===== BALLOT VIEW ===== */}
      {view === 'ballot' && selectedElection && (
        <>
          <div style={S(19, 81, 921, 432, '#1B2A3B')} />
          <div style={T(30, 91, 600, 38, '#FFFFFF', 18, 'left', true)}>{selectedElection.title}</div>
          <div style={T(30, 124, 600, 26, '#94A3B8', 13)}>Select your candidate and submit your vote</div>

          {candidates.map((c, i) => {
            const y = 161 + i * 80;
            const selected = selectedCandidate?._id === c._id;
            return (
              <div key={c._id} onClick={() => setSelectedCandidate(c)} style={{ cursor: 'pointer' }}>
                <div style={{ ...S(30, y, 600, 65, selected ? '#162032' : '#1E3A50'), border: `2px solid ${selected ? '#10B981' : '#334155'}`, borderRadius: 4 }} />
                <div style={{ ...T(50, y + 10, 400, 22, '#FFFFFF', 14, 'left', true), cursor: 'pointer' }}>{c.name}</div>
                <div style={{ ...T(50, y + 32, 400, 18, '#94A3B8', 12), cursor: 'pointer' }}>{c.party}</div>
                {selected && <div style={T(560, y + 15, 60, 25, '#10B981', 13, 'center', true)}>✓ SELECTED</div>}
              </div>
            );
          })}

          {receiptHash && (
            <div style={{ position: 'absolute', left: 30, top: 415, width: 600, fontSize: 11, color: '#00D4AA' }}>
              Receipt: {receiptHash.slice(0, 40)}...
            </div>
          )}

          <button onClick={() => setConfirmModal(true)} style={{ ...BTN(30, 448, 300, 40, '#10B981', '#000'), borderRadius: 4, fontSize: 14 }}>
            ✓  Confirm &amp; Submit Vote  →  Smart Contract
          </button>
          <button onClick={() => setView('dashboard')} style={{ ...BTN(345, 448, 120, 40, '#334155', '#FFF'), borderRadius: 4 }}>← Back</button>

          {/* Verify panel */}
          <div style={S(660, 81, 270, 432, '#162032')} />
          <div style={T(670, 91, 240, 28, '#FFFFFF', 14, 'left', true)}>🔒 Vote Verification</div>
          <div style={{ ...T(670, 124, 240, 48, '#94A3B8', 11, 'left'), lineHeight: 1.6 }}>Enter your SHA-256 receipt to verify your vote was recorded on-chain:</div>
          <input value={verifyInput} onChange={e => setVerifyInput(e.target.value)} placeholder="SHA-256 Receipt Hash..."
            style={{ position: 'absolute', left: 670, top: 185, width: 240, padding: '6px 8px', background: '#1B2A3B', border: '1px solid #334155', color: '#FFF', fontSize: 11, boxSizing: 'border-box' }} />
          <button onClick={handleVerify} style={{ ...BTN(670, 220, 240, 30, '#0EA5E9', '#000'), borderRadius: 2, fontSize: 12 }}>Verify on Blockchain</button>
          {verifyResult && (
            <>
              <div style={T(670, 260, 240, 20, '#10B981', 12, 'left', true)}>✓ VOTE VERIFIED</div>
              <div style={T(670, 282, 240, 18, '#94A3B8', 11)}>Election: {verifyResult.electionTitle}</div>
              <div style={T(670, 300, 240, 18, '#94A3B8', 11)}>Block #: {verifyResult.blockNumber?.toLocaleString()}</div>
              <div style={T(670, 318, 240, 18, '#94A3B8', 11)}>Privacy: {verifyResult.privacy}</div>
            </>
          )}
        </>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1B2A3B', border: '1px solid #10B981', borderRadius: 8, padding: 28, width: 340 }}>
            <div style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Confirm Your Vote</div>
            <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>Election: {selectedElection?.title}</div>
            <div style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 16 }}>Candidate: {selectedCandidate?.name}</div>
            <div style={{ color: '#EF4444', fontSize: 11, marginBottom: 16 }}>⚠ This action is IRREVERSIBLE on the blockchain.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmitVote} disabled={voting}
                style={{ flex: 1, padding: '8px 0', background: '#10B981', color: '#000', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>
                {voting ? 'Submitting...' : '✓ Confirm Vote'}
              </button>
              <button onClick={() => setConfirmModal(false)} style={{ padding: '8px 16px', background: '#334155', color: '#FFF', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
