const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');

// Helper: log action
const log = async (action, ip, payload = {}) => {
    await AuditLog.create({ action, actor: 'Admin', ip: ip || '127.0.0.1', payload });
};

// GET /api/admin/dashboard — stats
router.get('/dashboard', async (req, res) => {
    try {
        const totalElections = await Election.countDocuments();
        const activeElections = await Election.countDocuments({ status: 'ACTIVE' });
        const totalVotes = await Election.aggregate([{ $group: { _id: null, sum: { $sum: '$totalVotes' } } }]);
        const elections = await Election.find().sort({ createdAt: -1 });
        res.json({
            totalElections,
            activeElections,
            totalVotes: totalVotes[0]?.sum || 0,
            elections
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/elections — create election
router.post('/elections', async (req, res) => {
    const { title, description, startTime, endTime } = req.body;
    try {
        const election = await Election.create({ title, description, startTime, endTime, status: 'DRAFT' });
        await log('Election Created', req.ip, { electionId: election._id, title });
        req.app.get('io')?.emit('electionUpdate', election);
        res.status(201).json(election);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/admin/elections — get all elections
router.get('/elections', async (req, res) => {
    try {
        const elections = await Election.find().sort({ createdAt: -1 });
        res.json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/admin/elections/:id/status — change status
router.patch('/elections/:id/status', async (req, res) => {
    const { status } = req.body; // DRAFT | ACTIVE | CLOSED
    try {
        const election = await Election.findByIdAndUpdate(req.params.id, { status }, { new: true });
        await log(`Election ${status}`, req.ip, { electionId: req.params.id });
        req.app.get('io')?.emit('electionUpdate', election);
        res.json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/elections/:id/candidates — add candidate
router.post('/elections/:id/candidates', async (req, res) => {
    const { name, party, bio } = req.body;
    try {
        const candidate = await Candidate.create({ name, party, bio, electionId: req.params.id });
        await log('Candidate Added', req.ip, { electionId: req.params.id, name });
        res.status(201).json(candidate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/admin/elections/:id/candidates
router.get('/elections/:id/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find({ electionId: req.params.id });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/candidates/:id
router.delete('/candidates/:id', async (req, res) => {
    try {
        await Candidate.findByIdAndDelete(req.params.id);
        await log('Candidate Removed', req.ip, { candidateId: req.params.id });
        res.json({ message: 'Candidate removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/elections/:id/whitelist — whitelist a voter address
router.post('/elections/:id/whitelist', async (req, res) => {
    const { address } = req.body;
    try {
        const election = await Election.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { whitelistedAddresses: address } },
            { new: true }
        );
        await log('Voter Whitelisted', req.ip, { electionId: req.params.id, address });
        res.json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/elections/:id/emergency — emergency stop
router.post('/elections/:id/emergency', async (req, res) => {
    const { stop } = req.body; // true | false
    try {
        const election = await Election.findByIdAndUpdate(
            req.params.id,
            { emergencyStopped: stop, status: stop ? 'CLOSED' : 'ACTIVE' },
            { new: true }
        );
        await log(stop ? 'EMERGENCY STOP TRIGGERED' : 'Emergency Stop Lifted', req.ip, { electionId: req.params.id });
        req.app.get('io')?.emit('emergencyStop', { electionId: req.params.id, stop });
        res.json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/audit — get audit logs
router.get('/audit', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
