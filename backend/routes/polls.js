const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

// Get all polls
router.get('/', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a poll
router.post('/', async (req, res) => {
    const { question, options, creator, blockchainId } = req.body;

    const poll = new Poll({
        question,
        options: options.map(opt => ({ text: opt, votes: 0 })),
        creator,
        blockchainId
    });

    try {
        const newPoll = await poll.save();
        res.status(201).json(newPoll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update blockchain ID after creation on chain
router.patch('/:id/blockchainId', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        poll.blockchainId = req.body.blockchainId;
        await poll.save();
        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Sync votes (optional, if we want to sync from blockchain events)
router.post('/:id/vote', async (req, res) => {
    const { optionIndex } = req.body;
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ message: 'Invalid option index' });
        }

        poll.options[optionIndex].votes += 1;
        await poll.save();
        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
