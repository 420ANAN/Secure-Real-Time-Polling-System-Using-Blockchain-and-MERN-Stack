require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/votesecure')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/voter', require('./routes/voter'));
app.use('/api/polls', require('./routes/polls'));  // legacy
app.use('/api/register-voter', require('./routes/voterRegistration'));

app.get('/', (req, res) => {
    res.json({ status: 'VoteSecure API running', version: '2.0' });
});

server.listen(PORT, () => {
    console.log(`VoteSecure API Gateway running on port ${PORT}`);
});
