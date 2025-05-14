const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { setupSocket } = require('./socket'); // Sử dụng socket.js để thiết lập Socket.IO
const roomRouter = require('./routes/roomRoutes');
const { connectDb } = require('./utils/connectDb');
dotenv.config();

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json()); // Parse JSON cho request

// Tạo server HTTP từ ứng dụng Express
const server = http.createServer(app);

// Thiết lập Socket.IO
setupSocket(server);
app.use("/rooms", roomRouter)
    // Khởi động server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    connectDb()
    console.log(`Server is running on port ${PORT}`);
});