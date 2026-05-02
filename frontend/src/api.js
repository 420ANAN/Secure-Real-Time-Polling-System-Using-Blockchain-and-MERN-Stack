import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const adminAPI = {
    getDashboard: () => API.get('/admin/dashboard'),
    getElections: () => API.get('/admin/elections'),
    createElection: (data) => API.post('/admin/elections', data),
    setStatus: (id, status) => API.patch(`/admin/elections/${id}/status`, { status }),
    getCandidates: (id) => API.get(`/admin/elections/${id}/candidates`),
    addCandidate: (id, data) => API.post(`/admin/elections/${id}/candidates`, data),
    removeCandidate: (cid) => API.delete(`/admin/candidates/${cid}`),
    whitelistVoter: (id, address) => API.post(`/admin/elections/${id}/whitelist`, { address }),
    emergencyStop: (id, stop) => API.post(`/admin/elections/${id}/emergency`, { stop }),
    getAuditLogs: () => API.get('/admin/audit'),
};

export const voterAPI = {
    getElections: (address) => API.get(`/voter/elections?address=${address}`),
    getCandidates: (id) => API.get(`/voter/elections/${id}/candidates`),
    castVote: (data) => API.post('/voter/vote', data),
    verifyReceipt: (hash) => API.get(`/voter/verify/${hash}`),
    getResults: (id) => API.get(`/voter/results/${id}`),
    getStats: (address) => API.get(`/voter/stats/${address}`),
};
