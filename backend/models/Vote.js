const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    voterId: { type: String, required: true },
    electionId: { type: String, required: true },
    candidateId: { type: String, required: true },
    voterAddress: { type: String, required: true },
    receiptHash: { type: String, required: true, unique: true },
    txHash: { type: String, default: '' },
    blockNumber: { type: Number, default: 0 },
    votedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Vote', VoteSchema);
