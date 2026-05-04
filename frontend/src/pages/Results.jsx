import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';

const Results = () => {
  const [polls, setPolls] = useState([]);
  const { contract } = useContext(WalletContext);

  const fetchPolls = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/polls');
      setPolls(res.data);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!contract || polls.length === 0) return;

    const updateCounts = async () => {
      const updatedPolls = [...polls];
      let hasUpdates = false;

      for (let i = 0; i < polls.length; i++) {
        if (polls[i].blockchainId !== undefined && polls[i].blockchainId !== null) {
          try {
            const pollId = polls[i].blockchainId;
            const options = await contract.getOptions(pollId);
            const newOptions = polls[i].options.map((opt, idx) => ({
              ...opt,
              votes: Number(options[idx].voteCount)
            }));

            const currentVotes = polls[i].options.map(o => o.votes).join(',');
            const newVotes = newOptions.map(o => o.votes).join(',');

            if (currentVotes !== newVotes) {
              updatedPolls[i] = { ...polls[i], options: newOptions };
              hasUpdates = true;
            }
          } catch (err) {
            console.error(`Error fetching poll ${polls[i].blockchainId}:`, err);
          }
        }
      }
      if (hasUpdates) setPolls(updatedPolls);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 10000);
    return () => clearInterval(interval);
  }, [contract, polls.length]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', position: 'relative', color: '#FFF' }}>
      <Link to="/" style={{ position: 'absolute', top: 30, left: 30, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <span style={{ fontSize: 20 }}>←</span> RETURN HOME
      </Link>

      <div style={{ padding: '80px 40px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Live Election Results</h2>
        <p style={{ color: '#0EA5E9', fontSize: 16, marginBottom: 48, textAlign: 'center', fontWeight: 'bold' }}>REAL-TIME BLOCKCHAIN DATA</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 32 }}>
          {polls.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: 40, background: '#1B2A3B', borderRadius: 12 }}>
              Connecting to blockchain network...
            </div>
          )}
          {polls.map((poll) => {
             const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
             return (
              <div key={poll._id} style={{ background: '#1B2A3B', padding: 32, borderRadius: 16, border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 24 }}>{poll.question}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {poll.options.map((opt, idx) => {
                    const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 15 }}>
                          <span style={{ color: '#FFF', fontWeight: 'bold' }}>{opt.text}</span>
                          <span style={{ color: '#94A3B8' }}>{opt.votes} votes ({percentage}%)</span>
                        </div>
                        <div style={{ height: 12, background: '#162032', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #0EA5E9, #10B981)', transition: 'width 1s ease-in-out' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 24, fontSize: 12, color: '#334155', textAlign: 'right' }}>
                  Total Votes: {totalVotes.toLocaleString()}  •  Verified on Mainnet
                </div>
              </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;
