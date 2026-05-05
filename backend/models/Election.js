const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'CLOSED'], default: 'DRAFT' },
    startTime: { type: Date },
    endTime: { type: Date },
    totalVotes: { type: Number, default: 0 },
    whitelistedAddresses: [{ type: String }],
    emergencyStopped: { type: Boolean, default: false },
    blockchainId: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Election', ElectionSchema);
