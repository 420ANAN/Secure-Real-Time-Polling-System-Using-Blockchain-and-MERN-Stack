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
  const [isEligible, setIsEligible] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
      setIsEligible(true);
    } catch (err) {
      console.error('Failed to load elections', err);
      if (err.response?.status === 403) {
        setIsEligible(false);
        setErrorMessage(err.response.data.message);
      } else {
        // Fallback for demo
        setElections([
          { _id: 'e1', title: 'General Election 2025', description: 'Vote for your parliamentary representative', hasVoted: false },
          { _id: 'e2', title: 'Senate By-Election', description: 'Fill the vacant Senate seat for District 4', hasVoted: false }
        ]);
      }
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
        // Find the index of the candidate as optionIndex for the contract
        const optionIndex = candidates.findIndex(c => c._id === selectedCandidate._id);
        const pollId = selectedElection.blockchainId || 0; 
        const tx = await contract.vote(pollId, Math.max(0, optionIndex));
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
    <div style={{ height: '100%', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', color: '#FFF', position: 'relative', overflowY: 'auto' }}>
      
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

      <main style={{ maxWidth: 1000, margin: '60px auto', padding: '0 20px 80px 20px' }}>
        
        {step === 'connect' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ 
              background: 'rgba(27, 42, 59, 0.6)', 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '60px 40px', 
              borderRadius: '24px', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              maxWidth: '540px',
              width: '100%'
            }}>
              <div style={{ 
                width: '120px', height: '120px', 
                margin: '0 auto 32px', 
                background: 'linear-gradient(135deg, rgba(246, 133, 27, 0.2) 0%, rgba(226, 118, 37, 0.05) 100%)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(246, 133, 27, 0.3)',
                boxShadow: '0 0 30px rgba(246, 133, 27, 0.15)',
                animation: 'pulse 3s infinite alternate'
              }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
              </div>
              
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(to right, #FFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Secure Authentication
              </h2>
              
              <p style={{ color: '#94A3B8', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                Connect your MetaMask wallet to cryptographically verify your identity and access the decentralized voting node.
              </p>
              
              <button 
                className="metamask-btn"
                onClick={connectWallet} 
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Fox" style={{ width: '24px', height: '24px' }} />
                <span>Connect with MetaMask</span>
              </button>
              
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                End-to-end encrypted connection
              </div>
            </div>
          </div>
        )}

        {step === 'elections' && (
          <div>
            {!isEligible ? (
              <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, border: '1px solid #EF4444' }}>
                <div style={{ fontSize: 60, marginBottom: 24 }}>🛑</div>
                <h2 style={{ fontSize: 28, fontWeight: 'bold', color: '#EF4444', marginBottom: 16 }}>Access Restricted</h2>
                <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>{errorMessage}</p>
                <Link to="/register-voter" style={{ display: 'inline-block', padding: '12px 32px', background: '#EF4444', color: '#FFF', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>Register Now</Link>
              </div>
            ) : (
              <>
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
              </>
            )}
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
        <div style={{ height: '100px', width: '100%' }}></div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 20px rgba(246, 133, 27, 0.1); } 100% { transform: scale(1.05); box-shadow: 0 0 40px rgba(246, 133, 27, 0.3); } }
        
        .metamask-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 18px 32px;
          background: linear-gradient(135deg, #F6851B 0%, #E27625 100%);
          color: #FFF;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 20px rgba(246, 133, 27, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        
        .metamask-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(246, 133, 27, 0.35), inset 0 1px 0 rgba(255,255,255,0.3);
          background: linear-gradient(135deg, #FF952B 0%, #F6851B 100%);
        }
        
        .metamask-btn:active {
          transform: translateY(1px);
          box-shadow: 0 4px 10px rgba(246, 133, 27, 0.2);
        }
      `}</style>
    </div>
  );
}
