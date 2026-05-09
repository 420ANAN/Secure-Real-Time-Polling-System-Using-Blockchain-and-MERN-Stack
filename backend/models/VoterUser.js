const mongoose = require('mongoose');
const crypto = require('crypto');

const VoterUserSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    salt:         { type: String, required: true },
}, { timestamps: true });

// Hash password with salt
VoterUserSchema.statics.hashPassword = function(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return { salt, hash };
};

// Verify password
VoterUserSchema.methods.verifyPassword = function(password) {
    const hash = crypto.createHmac('sha256', this.salt).update(password).digest('hex');
    return hash === this.passwordHash;
};

module.exports = mongoose.model('VoterUser', VoterUserSchema);
