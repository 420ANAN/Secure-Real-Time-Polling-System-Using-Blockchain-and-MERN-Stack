const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    party: { type: String, default: 'Independent' },
    bio: { type: String, default: '' },
    electionId: { type: String, required: true },
    votes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);
