import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import API_BASE_URL from '../apiConfig';

const Results = () => {
  const [items, setItems] = useState([]);
  const { contract } = useContext(WalletContext);

  const fetchData = React.useCallback(async () => {
    try {
      const [pollsRes, electionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/polls`),
        axios.get(`${API_BASE_URL}/voter/public-results`)
      ]);

      const normalizedPolls = pollsRes.data.map(p => ({
        id: p._id,
        title: p.question,
        totalVotes: p.options.reduce((acc, curr) => acc + curr.votes, 0),
        options: p.options.map(o => ({ text: o.text, votes: o.votes })),
        blockchainId: p.blockchainId,
        type: 'Poll'
      }));

      const normalizedElections = electionsRes.data.map(e => ({
        id: e._id,
        title: e.title,
        totalVotes: e.totalVotes,
        options: e.candidates.map(c => ({ text: `${c.name} (${c.party})`, votes: c.votes })),
        blockchainId: e.blockchainId,
        type: 'Election'
      }));

      setItems([...normalizedElections, ...normalizedPolls]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!contract || items.length === 0) return;

    const updateCounts = async () => {
      const updatedItems = [...items];
      let hasUpdates = false;

      for (let i = 0; i < items.length; i++) {
        if (items[i].blockchainId !== undefined && items[i].blockchainId !== null) {
          try {
            const pollId = items[i].blockchainId;
            const options = await contract.getOptions(pollId);
            const newOptions = items[i].options.map((opt, idx) => ({
              ...opt,
              votes: Number(options[idx].voteCount)
            }));

            const currentVotes = items[i].options.map(o => o.votes).join(',');
            const newVotes = newOptions.map(o => o.votes).join(',');

            if (currentVotes !== newVotes) {
              updatedItems[i] = { ...items[i], options: newOptions };
              hasUpdates = true;
            }
          } catch (err) {
            console.error(`Error fetching contract data for ${items[i].title}:`, err);
          }
        }
      }
      if (hasUpdates) setItems(updatedItems);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 10000);
    return () => clearInterval(interval);
  }, [contract, items]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', position: 'relative', color: '#FFF' }}>
      <Link to="/" style={{ position: 'absolute', top: 20, left: 20, color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <span style={{ fontSize: 20 }}>←</span> <span className="hidden sm:inline">RETURN HOME</span>
      </Link>

      <div style={{ padding: '60px 20px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(24px, 8vw, 36px)', fontWeight: 'bold', marginBottom: 12, textAlign: 'center', marginTop: 40 }}>Live Election Results</h2>
        <p style={{ color: '#0EA5E9', fontSize: 'clamp(12px, 4vw, 16px)', marginBottom: 48, textAlign: 'center', fontWeight: 'bold' }}>REAL-TIME BLOCKCHAIN DATA</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 32 }}>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: 40, background: '#1B2A3B', borderRadius: 12 }}>
              No active elections or polls found.
            </div>
          )}
          {items.map((item) => {
             const totalVotes = item.options.reduce((acc, curr) => acc + curr.votes, 0);
             return (
              <div key={item.id} style={{ background: '#1B2A3B', padding: 32, borderRadius: 16, border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h3 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', margin: 0 }}>{item.title}</h3>
                  <span style={{ 
                    fontSize: 10, padding: '4px 8px', borderRadius: 4, 
                    background: item.type === 'Election' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                    color: item.type === 'Election' ? '#10B981' : '#0EA5E9',
                    border: `1px solid ${item.type === 'Election' ? '#10B98133' : '#0EA5E933'}`,
                    fontWeight: 'bold', textTransform: 'uppercase'
                  }}>{item.type}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {item.options.map((opt, idx) => {
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
                  Total Votes: {totalVotes.toLocaleString()}  •  Verified on Blockchain
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
