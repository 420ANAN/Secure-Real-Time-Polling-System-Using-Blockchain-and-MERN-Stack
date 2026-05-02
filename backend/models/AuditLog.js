const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    actor: { type: String, default: 'Admin' },
    ip: { type: String, default: '127.0.0.1' },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
