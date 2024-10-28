// server.js

const socketIO = require('socket.io');
const Room = require('./models/Room');
const mongoose = require("mongoose");
const User = require('./models/User');
const Company = require('./models/Company');

function setupSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    const users = {}; // Mapping giữa socket.id và username

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle user joining a room
        socket.on('joinRoom', async({ roomId, key, userId, companyId }) => {
            console.log(`User ${socket.id} is attempting to join room ${roomId} with key ${key}`);
            try {
                const room = await Room.findOne({ name: roomId });
                if (!room) {
                    socket.emit('error', 'Room does not exist');
                    console.log(`Room ${roomId} does not exist`);
                    return;
                }

                let userInfo = null;
                let userType = null;
                let username = null;

                // Kiểm tra key và lấy thông tin người dùng
                if (room.userkey === key) {
                    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                        userInfo = await User.findById(userId).lean();
                        userType = 'user';
                        username = `${userInfo.firstName} ${userInfo.lastName}`;
                    } else {
                        socket.emit('error', 'Invalid User ID');
                        console.log(`Invalid User ID: ${userId}`);
                        return;
                    }
                } else if (room.companykey === key) {
                    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
                        userInfo = await Company.findById(companyId).lean();
                        userType = 'company';
                        username = userInfo.companyname;
                    } else {
                        socket.emit('error', 'Invalid Company ID');
                        console.log(`Invalid Company ID: ${companyId}`);
                        return;
                    }
                } else {
                    socket.emit('error', 'Incorrect key');
                    console.log(`Incorrect key provided: ${key}`);
                    return;
                }

                if (!userInfo) {
                    socket.emit('error', 'User or company not found');
                    console.log('User or company not found');
                    return;
                }

                delete userInfo.password;
                delete userInfo.email;

                socket.username = username; // Lưu username vào socket instance
                socket.userType = userType;

                // Lưu mapping giữa socket.id và username
                users[socket.id] = username;

                // Kiểm tra và thêm username vào participants của phòng
                if (!room.participants.includes(username)) {
                    room.participants.push(username);
                    await room.save();
                }

                socket.join(roomId);
                console.log(`${username} (ID: ${socket.id}) joined room: ${roomId}`);

                socket.emit('userInfo', { userInfo, userType, username });

                // Gửi danh sách người dùng trong phòng
                const usersInRoom = [...io.sockets.adapter.rooms.get(roomId) || []].filter(id => id !== socket.id);

                const usersInfo = usersInRoom.map(id => {
                    return { socketId: id, username: users[id] };
                });

                console.log(`Users in room ${roomId}:`, usersInfo);

                socket.emit('allUsers', usersInfo);

                // Thông báo tới người khác về người dùng mới
                socket.to(roomId).emit('userJoined', { username, socketId: socket.id });

            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', 'An error occurred while joining the room');
            }
        });

        // Handle user leaving a room
        socket.on('leaveRoom', async({ roomId }) => {
            console.log(`User ${socket.id} is attempting to leave room ${roomId}`);
            try {
                let room = await Room.findOne({ name: roomId });
                if (!room) {
                    socket.emit('error', 'Phòng không tồn tại');
                    console.log(`Room ${roomId} does not exist`);
                    return;
                }

                const username = users[socket.id];

                if (!username) {
                    socket.emit('error', 'Username is not defined for this socket');
                    console.log(`Username is not defined for socket ${socket.id}`);
                    return;
                }

                // Remove user from participants
                room.participants = room.participants.filter(participant => participant !== username);
                await room.save();

                socket.leave(roomId);
                io.to(roomId).emit('userDisconnected', { username, socketId: socket.id });
                console.log(`${username} (ID: ${socket.id}) left room: ${roomId}`);

                // Remove mapping
                delete users[socket.id];

            } catch (error) {
                console.error('Error leaving room:', error);
                socket.emit('error', 'Có lỗi xảy ra khi rời phòng');
            }
        });

        // Handle offer
        socket.on('offer', ({ offer, to }) => {
            console.log(`User ${socket.id} sent offer to ${to}`);
            io.to(to).emit('offer', { offer, from: socket.id });
        });

        // Handle answer
        socket.on('answer', ({ answer, to }) => {
            console.log(`User ${socket.id} sent answer to ${to}`);
            io.to(to).emit('answer', { answer, from: socket.id });
        });

        // Handle ICE candidates
        socket.on('candidate', ({ candidate, to }) => {
            console.log(`User ${socket.id} sent candidate to ${to}`);
            io.to(to).emit('candidate', { candidate, from: socket.id });
        });

        // Handle chat messages
        socket.on('sendMessage', ({ roomId, message }) => {
            console.log(`User ${socket.id} sent message to room ${roomId}: ${message.message}`);
            io.to(roomId).emit('receiveMessage', message);
        });

        // Handle unexpected disconnections
        socket.on('disconnect', async() => {
            console.log('User disconnected:', socket.id);
            try {
                const username = users[socket.id];

                if (!username) {
                    console.error('Username is not defined for this socket');
                    return;
                }

                // Remove from users mapping
                delete users[socket.id];

                // Find rooms where this user is a participant
                const rooms = await Room.find({ participants: username });
                for (let room of rooms) {
                    room.participants = room.participants.filter(participant => participant !== username);
                    await room.save();
                    io.to(room.name).emit('userDisconnected', { username, socketId: socket.id });
                }
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });
}

module.exports = { setupSocket };