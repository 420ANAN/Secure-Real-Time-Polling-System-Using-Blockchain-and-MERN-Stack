const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '208.67.222.222']);
const Election = require('./models/Election');
require('dotenv').config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const activeElections = await Election.find({ status: 'ACTIVE' });
        console.log('Active Elections count:', activeElections.length);
        activeElections.forEach(e => {
            console.log(`- Title: ${e.title}, Status: ${e.status}, Stopped: ${e.emergencyStopped}`);
        });
        const allElections = await Election.find();
        console.log('Total Elections count:', allElections.length);
        allElections.forEach(e => {
            console.log(`- Title: ${e.title}, Status: ${e.status}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
