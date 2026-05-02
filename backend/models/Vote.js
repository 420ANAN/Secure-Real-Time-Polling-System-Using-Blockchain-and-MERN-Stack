const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    electionId: { type: String, required: true },
    candidateId: { type: String, required: true },
    voterAddress: { type: String, required: true },
    receiptHash: { type: String, required: true, unique: true },
    txHash: { type: String, default: '' },
    blockNumber: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vote', VoteSchema);
