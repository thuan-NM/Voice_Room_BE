const socketIO = require('socket.io');

module.exports = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: '*', // Bạn cần cài đặt CORS nếu deploy
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Người dùng kết nối:', socket.id);

        // Khi người dùng tham gia phòng
        socket.on('joinRoom', ({ roomId, username }) => {
            socket.join(roomId);
            io.to(roomId).emit('userJoined', { username });

            socket.on('offer', (data) => {
                socket.to(roomId).emit('offer', data);
            });

            socket.on('answer', (data) => {
                socket.to(roomId).emit('answer', data);
            });

            socket.on('candidate', (data) => {
                socket.to(roomId).emit('candidate', data);
            });
        });

        socket.on('disconnect', () => {
            console.log('Người dùng đã ngắt kết nối:', socket.id);
        });
    });
};