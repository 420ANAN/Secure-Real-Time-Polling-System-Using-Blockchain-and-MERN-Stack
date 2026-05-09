require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const VoterUser = require('./models/VoterUser');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
.then(async () => {
    const users = await VoterUser.find({}).limit(5);
    console.log('Sample Users:', users.map(u => u.email));
    process.exit(0);
})
.catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
