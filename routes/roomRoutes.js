const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, leaveRoom, getRoom } = require('../controllers/roomController');

router.post('/create', createRoom);
router.post('/join/:roomId', joinRoom);
router.post('/leave/:roomId', leaveRoom);
router.get('/:roomId', getRoom);

module.exports = router;