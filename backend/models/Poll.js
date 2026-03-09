const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }, // verifiable on blockchain, stored here for quick access
    }],
    creator: {
        type: String, // Wallet address
        required: true,
    },
    blockchainId: {
        type: Number, // ID on the smart contract
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Poll', PollSchema);
