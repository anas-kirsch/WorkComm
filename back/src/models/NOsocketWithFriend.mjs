import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server);
const PORT = 4900;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Listener global, à ne mettre qu'une seule fois
io.on('connection', (socket) => {
    socket.on('join_private_chat', ({ userId, friendId }) => {
        const roomName = [userId, friendId].sort().join('_');
        socket.join(roomName);
        console.log(`User ${userId} joined room ${roomName}`);
    });

    socket.on('private_message', ({ from, to, message }) => {
        const roomName = [from, to].sort().join('_');
        io.to(roomName).emit('private_message', { from, to, message });
        console.log(`Message from ${from} to ${to}: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

/**
 * 
 * @param {number} userId 
 * @param {number} friendId 
 * @returns 
 */
export function getRoomName(userId, friendId) {
    return [userId, friendId].sort().join('_');
}