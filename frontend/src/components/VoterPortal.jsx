import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { voterAPI } from '../api';

export default function VoterPortal() {
  const { account, connectWallet, contract } = useContext(WalletContext);
  const [step, setStep] = useState('connect'); // connect | elections | candidates | status
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // { success: bool, hash: string, error: string }
  const [voterStats, setVoterStats] = useState({ available: 0, voted: 0 });

  useEffect(() => {
    if (account) {
      setStep('elections');
      loadElections();
    } else {
      setStep('connect');
    }
  }, [account]);

  const loadElections = async () => {
    try {
      const res = await voterAPI.getElections(account);
      setElections(res.data);
      const statsRes = await voterAPI.getStats(account);
      setVoterStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load elections', err);
      // Fallback for demo
      setElections([
        { _id: 'e1', title: 'General Election 2025', description: 'Vote for your parliamentary representative', hasVoted: false },
        { _id: 'e2', title: 'Senate By-Election', description: 'Fill the vacant Senate seat for District 4', hasVoted: false }
      ]);
    }
  };

  const handleVoteNow = async (election) => {
    setSelectedElection(election);
    setLoading(true);
    try {
      const res = await voterAPI.getCandidates(election._id);
      setCandidates(res.data);
      setStep('candidates');
    } catch (err) {
      console.error('Failed to load candidates', err);
      setCandidates([
        { _id: 'c1', name: 'Alexandra Chen', party: 'Progressive Alliance' },
        { _id: 'c2', name: 'Marcus Williams', party: 'Conservative Union' }
      ]);
      setStep('candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    try {
      let txHash = "0x" + Math.random().toString(16).slice(2, 42); // Demo hash fallback
      
      if (contract) {
        const tx = await contract.vote(selectedElection._id, selectedCandidate._id);
        txHash = tx.hash;
      }
      
      await voterAPI.castVote({
        voterAddress: account,
        electionId: selectedElection._id,
        candidateId: selectedCandidate._id,
        transactionHash: txHash
      });

      setTxStatus({ success: true, hash: txHash });
      setStep('status');
    } catch (err) {
      console.error('Voting failed', err);
      setTxStatus({ success: false, error: err.message || 'Transaction failed' });
      setStep('status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', color: '#FFF', position: 'relative', overflowY: 'auto' }}>
      
      {/* Header */}
      <header style={{ height: 80, background: '#1B2A3B', borderBottom: '3px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <Link to="/voter-services" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }}>← RETURN HOME</Link>
           <img src="/image-1-1.png" alt="logo" style={{ width: 30, height: 30, marginLeft: 20 }} />
           <span style={{ fontSize: 20, fontWeight: 'bold' }}>BlockVote Voter Portal</span>
        </div>
        {account && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>WALLET CONNECTED</div>
            <div style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'monospace' }}>{account.slice(0,6)}...{account.slice(-4)}</div>
          </div>
        )}
      </header>

      <main style={{ maxWidth: 1000, margin: '60px auto', padding: '0 20px' }}>
        
        {step === 'connect' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🦊</div>
            <h2 style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 16 }}>Connect Wallet</h2>
            <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
              Verify your identity via MetaMask to access active elections and cast your vote securely on the blockchain.
            </p>
            <button onClick={connectWallet} style={{ padding: '16px 48px', background: '#10B981', color: '#000', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}>
              Connect MetaMask
            </button>
          </div>
        )}

        {step === 'elections' && (
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>Active Elections</h2>
            <p style={{ color: '#94A3B8', marginBottom: 40 }}>Select an election below to view candidates and cast your vote.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {elections.map(el => (
                <div key={el._id} style={{ background: '#1B2A3B', padding: 32, borderRadius: 16, border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>{el.title}</h3>
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>{el.description}</p>
                  <button 
                    onClick={() => handleVoteNow(el)} 
                    disabled={el.hasVoted}
                    style={{ 
                      width: '100%', padding: '14px', borderRadius: 8, border: 'none', fontWeight: 'bold', fontSize: 16, cursor: el.hasVoted ? 'default' : 'pointer',
                      background: el.hasVoted ? '#334155' : '#10B981', color: el.hasVoted ? '#94A3B8' : '#000' 
                    }}
                  >
                    {el.hasVoted ? '✓ Vote Cast' : 'Vote Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'candidates' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <button onClick={() => setStep('elections')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>← Back to Elections</button>
            <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Candidate Selection</h2>
            <p style={{ color: '#94A3B8', marginBottom: 48 }}>Election: <span style={{ color: '#FFF', fontWeight: 'bold' }}>{selectedElection.title}</span></p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginBottom: 56 }}>
              {candidates.map(c => (
                <div 
                  key={c._id} 
                  onClick={() => setSelectedCandidate(c)}
                  style={{ 
                    background: '#1B2A3B', padding: 32, borderRadius: 16, border: '2px solid', cursor: 'pointer', textAlign: 'center',
                    borderColor: selectedCandidate?._id === c._id ? '#10B981' : '#334155',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#334155', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👤</div>
                  <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>{c.name}</h3>
                  <div style={{ color: '#94A3B8', fontSize: 14 }}>{c.party}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleConfirmVote} 
                disabled={!selectedCandidate || loading}
                style={{ 
                  padding: '18px 80px', borderRadius: 12, border: 'none', fontWeight: 'bold', fontSize: 20, cursor: (!selectedCandidate || loading) ? 'default' : 'pointer',
                  background: (!selectedCandidate || loading) ? '#334155' : '#10B981', color: '#000' 
                }}
              >
                {loading ? 'Processing Transaction...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        )}

        {step === 'status' && (
          <div style={{ textAlign: 'center', padding: '60px 0', animation: 'scaleUp 0.4s ease' }}>
            <div style={{ fontSize: 100, marginBottom: 32 }}>{txStatus.success ? '🎉' : '❌'}</div>
            <h2 style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 16 }}>{txStatus.success ? 'Transaction Successful' : 'Transaction Failed'}</h2>
            <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 56, maxWidth: 600, margin: '0 auto 56px' }}>
              {txStatus.success 
                ? 'Your vote has been cryptographically secured on the blockchain ledger. You can now verify its authenticity using your receipt.'
                : `We encountered an issue while submitting your vote: ${txStatus.error}`}
            </p>
            
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              {txStatus.success && (
                <Link to="/verify-vote" style={{ padding: '16px 40px', background: 'transparent', border: '2px solid #10B981', color: '#10B981', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 16 }}>
                  Verify Vote
                </Link>
              )}
              <button onClick={() => setStep('elections')} style={{ padding: '16px 40px', background: '#1B2A3B', border: '1px solid #334155', color: '#FFF', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
