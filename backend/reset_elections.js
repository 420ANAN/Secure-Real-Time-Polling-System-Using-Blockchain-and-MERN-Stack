const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '208.67.222.222']);
const Election = require('./models/Election');
require('dotenv').config();

async function resetElections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const result = await Election.updateMany(
            { status: 'ACTIVE' },
            { $set: { emergencyStopped: false } }
        );
        console.log(`Updated ${result.modifiedCount} elections to emergencyStopped: false`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetElections();
