require('dotenv').config({ override: true });
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;
console.log('Testing connection to:', mongoURI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('✅ MongoDB Connected successfully in test script');
    process.exit(0);
})
.catch(err => {
    console.error('❌ MongoDB connection error in test script:', err.message);
    process.exit(1);
});
