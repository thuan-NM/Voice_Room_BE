const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    participants: [{ type: String }],
});

module.exports = mongoose.model('Room', roomSchema);