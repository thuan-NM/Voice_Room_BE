// controllers/roomController.js
const Room = require('../models/Room'); // Import model Room

// Tạo phòng
exports.createRoom = async (req, res) => {
    const { name, userkey, companykey } = req.body; // Thêm userkey và companykey vào
    try {
        // Kiểm tra xem phòng đã tồn tại chưa
        let room = await Room.findOne({ name });
        if (room) {
            // Trả lại thông tin phòng hiện có mà không lộ companykey
            return res.status(200).json({
                success: true,
                data: {
                    _id: room._id,
                    userkey: room.userkey,
                    // Không trả lại companykey để bảo mật
                },
                message: 'Room already exists',
            });
        }

        // Nếu phòng chưa tồn tại, tạo mới
        room = new Room({ name, userkey, companykey });
        await room.save();
        res.status(201).json({
            success: true,
            data: {
                _id: room._id,
                userkey: room.userkey,
                // Không trả lại companykey để bảo mật
            },
            message: 'Room created successfully',
        });
    } catch (error) {
        console.error(error); // Ghi log lỗi để dễ dàng theo dõi
        if (error.code === 11000) { // Mã lỗi trùng lặp trong MongoDB
            return res.status(400).json({ success: false, message: 'Room name must be unique.' });
        }
        res.status(500).json({ success: false, message: 'Lỗi tạo phòng' });
    }
};

// Tham gia phòng
exports.joinRoom = async (req, res) => {
    const { roomId } = req.params;
    const { username } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

        // Kiểm tra xem người dùng đã tham gia chưa
        if (room.participants.includes(username)) {
            return res.status(400).json({ success: false, message: 'User đã tham gia phòng này.' });
        }

        room.participants.push(username);
        await room.save();
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi tham gia phòng' });
    }
};

// Rời phòng
exports.leaveRoom = async (req, res) => {
    const { roomId } = req.params;
    const { username } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

        room.participants = room.participants.filter(participant => participant !== username);
        await room.save();
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi rời phòng' });
    }
};

// Lấy thông tin phòng
exports.getRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ name: roomId });
        if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

        res.status(200).json({
            success: true,
            data: {
                name: room.name,
                userkey: room.userkey,
                // Không trả về companykey để bảo mật
                participants: room.participants, // Chỉ trả về danh sách username
            },
            message: 'Lấy thông tin phòng thành công',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi lấy thông tin phòng' });
    }
};
