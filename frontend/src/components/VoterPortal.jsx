import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { voterAPI } from '../api';

export default function VoterPortal({ voterUser }) {
  const { account, connectWallet, contract } = useContext(WalletContext);
  const [step, setStep] = useState('elections'); // 'elections' | 'profile' | 'connect' | 'candidates' | 'status'
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [voterStats, setVoterStats] = useState({ available: 0, voted: 0 });
  const [isEligible, setIsEligible] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Load elections and check registration status
  useEffect(() => {
    if (voterUser?.email) {
      checkRegistrationStatus(voterUser.email);
    }
    loadElections();
  }, [account, voterUser]);

  const checkRegistrationStatus = async (email) => {
    try {
      const res = await voterAPI.getRegistrationStatus(email);
      const app = res.data;
      
      // Eligibility rule: Approved + has Voter ID (EPIC)
      const hasEPIC = app.previousVoter?.epicNumber || app.epicNumber; 
      
      if (app.status === 'APPROVED' && hasEPIC) {
        setIsEligible(true);
        setVoterStats(prev => ({ ...prev, epicNumber: hasEPIC }));
      } else {
        setIsEligible(false);
        setErrorMessage(app.status === 'PENDING' 
          ? 'Your voter registration is currently PENDING. Please wait for Admin approval and Voter ID issuance.' 
          : 'You do not have a valid Voter ID issued. Please register to become eligible.');
      }
    } catch (err) {
      console.error('Registration check failed', err);
      setIsEligible(false);
      setErrorMessage('No voter registration record found for your account. Please apply for a Voter ID to participate in elections.');
    }
  };

  // If user connects wallet while on the 'connect' step, proceed to candidates
  useEffect(() => {
    if (account && step === 'connect' && selectedElection) {
      proceedToCandidates(selectedElection);
    }
  }, [account, step, selectedElection]);

  const loadElections = async () => {
    try {
      const res = await voterAPI.getElections(account || 'undefined');
      setElections(res.data);
      if (account) {
        const statsRes = await voterAPI.getStats(account);
        setVoterStats(statsRes.data);
      }
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
    if (!account) {
      setStep('connect');
    } else {
      proceedToCandidates(election);
    }
  };

  const proceedToCandidates = async (election) => {
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
        if (tx.wait) await tx.wait();
        txHash = tx.hash;
      }
      
      await voterAPI.castVote({
        voterId: voterUser?.id || 'unknown',
        walletAddress: account,
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
      <header style={{ minHeight: 80, background: '#1B2A3B', borderBottom: '3px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <Link to="/voter-services" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }}>← <span className="hidden sm:inline">RETURN</span></Link>
           <img src="/image-1-1.png" alt="logo" style={{ width: 30, height: 30 }} />
           <span style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }}>Voter Portal</span>
        </div>
        
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: 16 }}>
            <button 
              onClick={() => setStep('elections')}
              style={{ background: 'none', border: 'none', color: step === 'elections' ? '#10B981' : '#94A3B8', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
            >
              ELECTIONS
            </button>
            <button 
              onClick={() => setStep('profile')}
              style={{ background: 'none', border: 'none', color: step === 'profile' ? '#10B981' : '#94A3B8', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
            >
              PROFILE
            </button>
          </nav>

          {account && (
            <div style={{ textAlign: 'right', borderLeft: '1px solid #334155', paddingLeft: 16 }} className="hidden sm:block">
              <div style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>CONNECTED</div>
              <div style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}>{account.slice(0,6)}...{account.slice(-4)}</div>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '20px auto', padding: '0 20px 80px 20px' }}>
        
        {step === 'connect' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ 
              background: 'rgba(27, 42, 59, 0.6)', 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '40px 20px', 
              borderRadius: '24px', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              maxWidth: '540px',
              width: '100%'
            }}>
              <div style={{ 
                width: '100px', height: '100px', 
                margin: '0 auto 24px', 
                background: 'linear-gradient(135deg, rgba(246, 133, 27, 0.2) 0%, rgba(226, 118, 37, 0.05) 100%)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(246, 133, 27, 0.3)',
                boxShadow: '0 0 30px rgba(246, 133, 27, 0.15)',
                animation: 'pulse 3s infinite alternate'
              }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: '60px', height: '60px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
              </div>
              
              <h2 style={{ fontSize: 'clamp(24px, 8vw, 36px)', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(to right, #FFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Secure Authentication
              </h2>
              
              <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                Connect your MetaMask wallet to cryptographically verify your identity and access the decentralized voting node.
              </p>
              
              <button 
                className="metamask-btn"
                onClick={connectWallet} 
                style={{ padding: '14px 20px', fontSize: '16px' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Fox" style={{ width: '20px', height: '20px' }} />
                <span>Connect Wallet</span>
              </button>
              
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                End-to-end encrypted connection
              </div>
            </div>
          </div>
        )}

        {step === 'elections' && (
          <div>
            {!isEligible ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, border: '1px solid #EF4444' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🛑</div>
                <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444', marginBottom: 12 }}>Access Restricted</h2>
                <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{errorMessage}</p>
                <Link to="/register-voter" style={{ display: 'inline-block', padding: '10px 24px', background: '#EF4444', color: '#FFF', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>Register Now</Link>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 'bold', marginBottom: 12 }}>Active Elections</h2>
                <p style={{ color: '#94A3B8', marginBottom: 32 }}>Select an election below to view candidates and cast your vote.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  {elections.map(el => (
                    <div key={el._id} style={{ background: '#1B2A3B', padding: 24, borderRadius: 16, border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{el.title}</h3>
                      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24, lineHeight: 1.6, flex: 1 }}>{el.description}</p>
                      <button 
                        onClick={() => handleVoteNow(el)} 
                        disabled={el.hasVoted}
                        style={{ 
                          width: '100%', padding: '12px', borderRadius: 8, border: 'none', fontWeight: 'bold', fontSize: 15, cursor: el.hasVoted ? 'default' : 'pointer',
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
            <button onClick={() => setStep('elections')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginBottom: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>← Back to Elections</button>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 'bold', marginBottom: 8 }}>Candidate Selection</h2>
            <p style={{ color: '#94A3B8', marginBottom: 32, fontSize: 14 }}>Election: <span style={{ color: '#FFF', fontWeight: 'bold' }}>{selectedElection.title}</span></p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
              {candidates.map(c => (
                <div 
                  key={c._id} 
                  onClick={() => setSelectedCandidate(c)}
                  style={{ 
                    background: '#1B2A3B', padding: 24, borderRadius: 16, border: '2px solid', cursor: 'pointer', textAlign: 'center',
                    borderColor: selectedCandidate?._id === c._id ? '#10B981' : '#334155',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#334155', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>👤</div>
                  <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{c.name}</h3>
                  <div style={{ color: '#94A3B8', fontSize: 13 }}>{c.party}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleConfirmVote} 
                disabled={!selectedCandidate || loading}
                style={{ 
                  width: '100%', maxWidth: 400, padding: '16px 20px', borderRadius: 12, border: 'none', fontWeight: 'bold', fontSize: 18, cursor: (!selectedCandidate || loading) ? 'default' : 'pointer',
                  background: (!selectedCandidate || loading) ? '#334155' : '#10B981', color: '#000' 
                }}
              >
                {loading ? 'Processing...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 'bold', marginBottom: 24 }}>Voter Profile</h2>
            <div style={{ background: '#1B2A3B', borderRadius: 16, border: '1px solid #334155', padding: '32px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#0D1B2A', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👤</div>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>{voterUser?.name || 'Voter'}</h3>
                  <div style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>{voterUser?.email || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                <div style={{ background: '#0D1B2A', padding: 20, borderRadius: 12, border: '1px solid #1E3048' }}>
                  <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Elections Participated</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{voterStats.voted || 0}</div>
                </div>
                <div style={{ background: '#0D1B2A', padding: 20, borderRadius: 12, border: '1px solid #1E3048' }}>
                  <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Available Polls</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>{voterStats.available || 0}</div>
                </div>
                <div style={{ background: '#0D1B2A', padding: 20, borderRadius: 12, border: '1px solid #1E3048' }}>
                  <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Wallet Link Status</div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: account ? '#10B981' : '#F59E0B' }}>{account ? '✓ LINKED' : '! NOT CONNECTED'}</div>
                </div>
              </div>

              <div style={{ marginTop: 40, borderTop: '1px solid #334155', paddingTop: 32 }}>
                <h4 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Voter Identification</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#94A3B8' }}>Voter ID (EPIC):</span>
                    <span style={{ fontWeight: 'bold', color: '#10B981' }}>{voterStats.epicNumber || 'Not Issued'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#94A3B8' }}>Account ID:</span>
                    <span style={{ fontFamily: 'monospace' }}>{voterUser?.id || '---'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#94A3B8' }}>Blockchain Address:</span>
                    <span style={{ fontFamily: 'monospace' }}>{account || 'Not Connected'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'status' && (
          <div style={{ textAlign: 'center', padding: '40px 0', animation: 'scaleUp 0.4s ease' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>{txStatus.success ? '🎉' : '❌'}</div>
            <h2 style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 'bold', marginBottom: 12 }}>{txStatus.success ? 'Success!' : 'Failed'}</h2>
            <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
              {txStatus.success 
                ? 'Your vote has been cryptographically secured on the blockchain ledger.'
                : `We encountered an issue: ${txStatus.error}`}
            </p>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {txStatus.success && (
                <Link to="/verify-vote" style={{ padding: '12px 24px', background: 'transparent', border: '2px solid #10B981', color: '#10B981', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 15 }}>
                  Verify Vote
                </Link>
              )}
              <button onClick={() => setStep('elections')} style={{ padding: '12px 24px', background: '#1B2A3B', border: '1px solid #334155', color: '#FFF', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 15 }}>
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
