require('dotenv').config({ override: true }); // override stale system ENV vars
const dns = require('dns');
// Use a robust list of DNS servers to resolve SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '208.67.222.222']);
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
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/votesecure';
console.log('Connecting to MongoDB cluster:', mongoURI.replace(/:([^@]+)@/, ':****@')); // log URI (password masked)

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        if (err.message.includes('IP address is not whitelisted')) {
            console.error('👉 TIP: Go to MongoDB Atlas > Network Access and add your current IP or 0.0.0.0/0');
        } else if (err.message.includes('Could not connect to any servers')) {
            console.error('👉 TIP: This is usually an IP Whitelist issue or a firewall blocking the connection.');
            console.error('   Verify your IP is added to the Atlas cluster Network Access.');
        }
        console.error('   Code:', err.code, '| Hostname:', err.hostname || 'N/A');
    });

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/voter', require('./routes/voter'));
app.use('/api/polls', require('./routes/polls'));  // legacy
app.use('/api/register-voter', require('./routes/voterRegistration'));
app.use('/api/voter-auth', require('./routes/voterAuth'));

app.get('/', (req, res) => {
    res.json({ status: 'VoteSecure API running', version: '2.0' });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`VoteSecure API Gateway running on port ${PORT}`);
});
