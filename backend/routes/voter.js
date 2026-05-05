const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// GET /api/voter/elections — get active elections for a wallet address
router.get('/elections', async (req, res) => {
    const { address } = req.query;
    try {
        // Eligibility Check: Must have an APPROVED VoterApplication
        if (address) {
            const VoterApplication = require('../models/VoterApplication');
            const application = await VoterApplication.findOne({ 
                walletAddress: address.toLowerCase(), 
                status: 'APPROVED' 
            });
            
            if (!application) {
                return res.status(403).json({ 
                    message: 'Access Denied: You must be an approved voter to view elections. Please register and wait for Admin approval.',
                    isEligible: false 
                });
            }
        }

        const elections = await Election.find({ status: 'ACTIVE', emergencyStopped: false });
        
        // For each election, check if voter has already voted and is whitelisted
        const enriched = await Promise.all(elections.map(async (e) => {
            const hasVoted = await Vote.findOne({ electionId: e._id.toString(), voterAddress: address });
            const isWhitelisted = !address || e.whitelistedAddresses.includes(address) || e.whitelistedAddresses.length === 0;
            return {
                ...e.toObject(),
                hasVoted: !!hasVoted,
                isEligible: isWhitelisted && !hasVoted
            };
        }));
        
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/voter/elections/:id/candidates
router.get('/elections/:id/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find({ electionId: req.params.id });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/voter/vote — cast a vote
router.post('/vote', async (req, res) => {
    const { electionId, candidateId, voterAddress } = req.body;
    
    if (!voterAddress || !electionId || !candidateId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check election is active and not emergency stopped
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'ACTIVE') return res.status(400).json({ message: 'Election is not active' });
        if (election.emergencyStopped) return res.status(400).json({ message: 'Voting halted by emergency stop' });

        // One-person-one-vote check
        const alreadyVoted = await Vote.findOne({ electionId, voterAddress });
        if (alreadyVoted) return res.status(409).json({ message: 'You have already voted in this election' });

        // Check eligibility (whitelist)
        if (election.whitelistedAddresses.length > 0 && !election.whitelistedAddresses.includes(voterAddress)) {
            return res.status(403).json({ message: 'Address not whitelisted for this election' });
        }

        // Generate SHA-256 receipt (hides candidate choice)
        const receiptData = `${electionId}-${voterAddress}-${Date.now()}`;
        const receiptHash = crypto.createHash('sha256').update(receiptData).digest('hex');

        // Save vote
        const vote = await Vote.create({
            electionId,
            candidateId,
            voterAddress,
            receiptHash,
            txHash: `0x${receiptHash.slice(0, 40)}`, // Mock tx hash
            blockNumber: Math.floor(Math.random() * 1000000) + 18000000
        });

        // Update tally
        await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
        await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });

        // Broadcast live update via Socket.io
        req.app.get('io')?.emit('voteUpdate', { electionId, candidateId });

        res.status(201).json({ receiptHash, txHash: vote.txHash, blockNumber: vote.blockNumber });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Duplicate vote detected' });
        res.status(500).json({ message: err.message });
    }
});

// GET /api/voter/verify/:hash — verify a receipt hash
router.get('/verify/:hash', async (req, res) => {
    try {
        const vote = await Vote.findOne({ receiptHash: req.params.hash });
        if (!vote) return res.status(404).json({ message: 'Receipt not found on blockchain' });

        const election = await Election.findById(vote.electionId);

        res.json({
            verified: true,
            electionTitle: election?.title || 'Unknown Election',
            blockNumber: vote.blockNumber,
            txHash: vote.txHash,
            timestamp: vote.createdAt,
            receiptHash: vote.receiptHash,
            privacy: 'Candidate hidden ✓'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/voter/results/:id — live results for an election
router.get('/results/:id', async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });

        const candidates = await Candidate.find({ electionId: req.params.id }).sort({ votes: -1 });
        const totalVotes = election.totalVotes || 0;

        const results = candidates.map(c => ({
            id: c._id,
            name: c.name,
            party: c.party,
            votes: c.votes,
            percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0
        }));

        res.json({ election, results, totalVotes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/voter/stats/:address — dashboard stats for a voter
router.get('/stats/:address', async (req, res) => {
    try {
        const address = req.params.address;

        // Eligibility Check
        const VoterApplication = require('../models/VoterApplication');
        const application = await VoterApplication.findOne({ 
            walletAddress: address.toLowerCase(), 
            status: 'APPROVED' 
        });

        if (!application) {
            return res.json({ available: 0, voted: 0, pending: 0, isEligible: false });
        }

        const activeElections = await Election.countDocuments({ status: 'ACTIVE', emergencyStopped: false });
        const votedCount = await Vote.countDocuments({ voterAddress: address });
        const allActive = await Election.find({ status: 'ACTIVE' });
        const pendingCount = allActive.filter(e =>
            e.whitelistedAddresses.length === 0 || e.whitelistedAddresses.includes(address)
        ).length - votedCount;

        res.json({
            available: activeElections,
            voted: votedCount,
            pending: Math.max(0, pendingCount)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
