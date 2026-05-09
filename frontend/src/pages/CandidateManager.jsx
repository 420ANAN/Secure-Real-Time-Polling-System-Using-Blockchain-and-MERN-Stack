import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, voterAPI } from '../api';
import API_BASE_URL from '../apiConfig';

export default function CandidateManager() {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', party: '', bio: '' });

    const loadElections = async () => {
        try {
            const res = await adminAPI.getDashboard();
            setElections(res.data.elections);
            if (res.data.elections.length > 0 && !selectedElection) {
                setSelectedElection(res.data.elections[0]._id);
            }
        } catch (err) {
            console.error('Operation failed', err);
        }
    };

    const loadCandidates = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await voterAPI.getCandidates(id);
            setCandidates(res.data);
        } catch (err) {
            console.error('Operation failed', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadElections();
    }, []);

    useEffect(() => {
        if (selectedElection) loadCandidates(selectedElection);
    }, [selectedElection]);

    const handleAdd = async () => {
        if (!form.name || !selectedElection) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/elections/${selectedElection}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setForm({ name: '', party: '', bio: '' });
                loadCandidates(selectedElection);
            }
        } catch (e) { }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0D1B2A', fontFamily: 'Calibri, sans-serif', color: '#FFF' }}>
            {/* Header */}
            <header style={{ background: '#1B2A3B', borderBottom: '3px solid #10B981', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/admin" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }}>← <span className="hidden sm:inline">BACK</span></Link>
                    <h1 style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 'bold' }}>Candidate Management</h1>
                </div>
            </header>

            <main style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                    
                    {/* Selection Column */}
                    <section style={{ background: '#1B2A3B', borderRadius: 12, padding: 24, border: '1px solid #334155' }}>
                        <h2 style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Select Election</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                            {elections.map(el => (
                                <div 
                                    key={el._id} 
                                    onClick={() => setSelectedElection(el._id)}
                                    style={{ 
                                        padding: '12px 16px', borderRadius: 8, background: selectedElection === el._id ? 'rgba(16, 185, 129, 0.15)' : '#0D1B2A', 
                                        borderLeft: `4px solid ${selectedElection === el._id ? '#10B981' : 'transparent'}`, 
                                        color: selectedElection === el._id ? '#FFF' : '#94A3B8', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s'
                                    }}
                                >
                                    {el.title}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Form Column */}
                    <section style={{ background: '#1B2A3B', borderRadius: 12, padding: 24, border: '1px solid #334155' }}>
                        <h2 style={{ color: '#00D4AA', fontSize: 14, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Add Candidate</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ color: '#94A3B8', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>FULL NAME</label>
                                <input 
                                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                    placeholder="e.g. John Doe"
                                    style={{ width: '100%', padding: 12, background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94A3B8', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>PARTY NAME</label>
                                <input 
                                    value={form.party} onChange={e => setForm({...form, party: e.target.value})}
                                    placeholder="e.g. Independent"
                                    style={{ width: '100%', padding: 12, background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94A3B8', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>BIO (OPTIONAL)</label>
                                <textarea 
                                    value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                                    placeholder="Candidate background..."
                                    style={{ width: '100%', padding: 12, background: '#0D1B2A', border: '1px solid #334155', color: '#FFF', borderRadius: 6, height: 100, resize: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button 
                                onClick={handleAdd}
                                style={{ width: '100%', padding: 16, background: '#00D4AA', color: '#0D1B2A', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 16, marginTop: 8 }}
                            >
                                Add Candidate
                            </button>
                        </div>
                    </section>

                    {/* List Column */}
                    <section style={{ background: '#1B2A3B', borderRadius: 12, padding: 24, border: '1px solid #334155', gridColumn: '1 / -1' }}>
                        <h2 style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>Current Candidates</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                            {candidates.length === 0 ? (
                                <div style={{ color: '#475569', fontSize: 14, gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>No candidates added yet for this election.</div>
                            ) : (
                                candidates.map(c => (
                                    <div key={c._id} style={{ background: '#0D1B2A', padding: 20, borderRadius: 10, border: '1px solid #334155', display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1B2A3B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid #334155' }}>👤</div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: 16 }}>{c.name}</div>
                                            <div style={{ color: '#10B981', fontSize: 13, marginTop: 2, fontWeight: 'bold' }}>{c.party}</div>
                                            <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{c.bio || 'No bio provided'}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
