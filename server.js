const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const roomRoutes = require('./routes/roomRoutes');
const socketSetup = require('./socket');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Create server
const server = http.createServer(app);

// Setup socket
socketSetup(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});