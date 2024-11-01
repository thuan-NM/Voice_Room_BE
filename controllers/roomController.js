const Room = require('../models/Room');

// Tạo phòng
exports.createRoom = async(req, res) => {
    const { name, userkey, companykey } = req.body; // Thêm userkey và companykey vào
    try {
        // Tạo mới một phòng với các trường cần thiết
        const room = new Room({ name, userkey, companykey });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        console.error(error); // Ghi log lỗi để dễ dàng theo dõi
        res.status(500).json({ message: 'Lỗi tạo phòng' });
    }
};

// Tham gia phòng
exports.joinRoom = async(req, res) => {
    const { roomId } = req.params;
    const { username } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

        room.participants.push(username);
        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi tham gia phòng' });
    }
};

// Rời phòng
exports.leaveRoom = async(req, res) => {
    const { roomId } = req.params;
    const { username } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

        room.participants = room.participants.filter(participant => participant !== username);
        await room.save();
        res.status(200).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi rời phòng' });
    }
};

// Lấy thông tin phòng
// Lấy thông tin phòng
// Lấy thông tin phòng
exports.getRoom = async(req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ name: roomId });
        if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

        res.status(200).json({
            name: room.name,
            userkey: room.userkey,
            companykey: room.companykey,
            participants: room.participants, // Chỉ trả về danh sách username
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy thông tin phòng' });
    }
};