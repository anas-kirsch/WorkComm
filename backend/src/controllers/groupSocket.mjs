import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 9000;

io.on('connection', (socket) => {
    // Rejoindre un groupe (room)
    socket.on('join group', ({ groupId }) => {
        socket.join(groupId);
        socket.emit('joined', groupId);
    });

    // Envoyer un message à un groupe
    socket.on('group message', ({ groupId, userId, message }) => {
        io.to(groupId).emit('group message', {
            userId,
            message
        });
    });

    // Quitter un groupe
    socket.on('leave group', ({ groupId }) => {
        socket.leave(groupId);
        socket.emit('left', groupId);
    });
});

server.listen(PORT, () => {
    console.log(`Socket.io server running at http://0.0.0.0:${PORT}`);
});