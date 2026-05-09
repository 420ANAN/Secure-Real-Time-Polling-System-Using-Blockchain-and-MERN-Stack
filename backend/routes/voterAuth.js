const express = require('express');
const router = express.Router();
const VoterUser = require('../models/VoterUser');

// POST /api/voter-auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: 'Name, email and password are required.' });

    if (password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    try {
        const exists = await VoterUser.findOne({ email });
        if (exists)
            return res.status(409).json({ message: 'An account with this email already exists.' });

        const { salt, hash } = VoterUser.hashPassword(password);
        const user = await VoterUser.create({ name, email, passwordHash: hash, salt });

        res.status(201).json({
            message: 'Account created successfully!',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/voter-auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const user = await VoterUser.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'No account found with this email.' });

        if (!user.verifyPassword(password))
            return res.status(401).json({ message: 'Incorrect password.' });

        res.json({
            message: 'Login successful!',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
