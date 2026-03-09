require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const pollRoutes = require('./routes/polls');
app.use('/api/polls', pollRoutes);

app.get('/', (req, res) => {
    res.send('Polling System API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
