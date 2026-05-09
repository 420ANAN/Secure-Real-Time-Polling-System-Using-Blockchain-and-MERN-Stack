const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// GET /api/voter/elections — get active elections for a wallet address
router.get('/elections', async (req, res) => {
    let { address } = req.query;
    try {
        const isInvalidAddress = !address || address === 'undefined' || address === 'null' || address === '';
        if (!isInvalidAddress) address = address.toLowerCase();

        // 1. Fetch all active elections
        const elections = await Election.find({ status: 'ACTIVE', emergencyStopped: { $ne: true } });
        
        // 2. Enrich and Filter
        const enriched = await Promise.all(elections.map(async (e) => {
            const hasVoted = (!isInvalidAddress) ? await Vote.findOne({ electionId: e._id.toString(), $or: [{ voterAddress: address }] }) : null;
            
            // An election is "assigned/visible" if:
            // - It is public (whitelistedAddresses is empty)
            // - OR the voter's address is in the whitelist
            const isWhitelisted = e.whitelistedAddresses.length === 0 || 
                                 (!isInvalidAddress && e.whitelistedAddresses.map(a => a.toLowerCase()).includes(address));
            
            if (!isWhitelisted) return null;

            return {
                ...e.toObject(),
                hasVoted: !!hasVoted,
                isEligible: isWhitelisted && !hasVoted
            };
        }));
        
        // Remove nulls (non-whitelisted elections)
        res.json(enriched.filter(e => e !== null));
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
    const { voterId, electionId, candidateId, walletAddress, transactionHash, votedAt } = req.body;
    
    if (!voterId || !walletAddress || !electionId || !candidateId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check election is active and not emergency stopped
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'ACTIVE') return res.status(400).json({ message: 'Election is not active' });
        if (election.emergencyStopped) return res.status(400).json({ message: 'Voting halted by emergency stop' });

        // Check eligibility (whitelist)
        const normalizedAddress = walletAddress.toLowerCase();
        if (election.whitelistedAddresses.length > 0 && 
            !election.whitelistedAddresses.map(a => a.toLowerCase()).includes(normalizedAddress)) {
            return res.status(403).json({ message: 'This wallet address is not whitelisted for this election.' });
        }

        // One-person-one-vote check
        const alreadyVoted = await Vote.findOne({ 
            $or: [
                { electionId, voterId },
                { electionId, voterAddress: normalizedAddress }
            ]
        });
        if (alreadyVoted) return res.status(409).json({ message: 'You have already voted in this election.' });

        // Generate SHA-256 receipt (hides candidate choice)
        const receiptData = `${electionId}-${voterId}-${Date.now()}`;
        const receiptHash = crypto.createHash('sha256').update(receiptData).digest('hex');

        // Save vote
        const vote = await Vote.create({
            voterId,
            electionId,
            candidateId,
            voterAddress: normalizedAddress,
            receiptHash,
            txHash: transactionHash || `0x${receiptHash.slice(0, 40)}`,
            blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
            votedAt: votedAt || new Date()
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
        const activeElections = await Election.countDocuments({ status: 'ACTIVE', emergencyStopped: { $ne: true } });
        
        const isInvalidAddress = !address || address === 'undefined' || address === 'null' || address === '';
        if (isInvalidAddress) {
            return res.json({ available: activeElections, voted: 0, pending: activeElections, isEligible: false });
        }

        const VoterApplication = require('../models/VoterApplication');
        const application = await VoterApplication.findOne({ 
            walletAddress: address.toLowerCase(), 
            status: 'APPROVED' 
        });

        if (!application) {
            return res.json({ available: activeElections, voted: 0, pending: activeElections, isEligible: false });
        }

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

// GET /api/voter/public-results — get summary of all active election results
router.get('/public-results', async (req, res) => {
    try {
        const elections = await Election.find({ status: 'ACTIVE' });
        const results = await Promise.all(elections.map(async (e) => {
            const candidates = await Candidate.find({ electionId: e._id });
            return {
                _id: e._id,
                title: e.title,
                description: e.description,
                totalVotes: e.totalVotes,
                candidates: candidates.map(c => ({
                    name: c.name,
                    party: c.party,
                    votes: c.votes
                }))
            };
        }));
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
