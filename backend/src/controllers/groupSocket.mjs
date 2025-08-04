import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import cors from "cors"

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://192.168.10.125:4200", "http://192.168.1.248:4200"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = 9000;

app.use(cors({
  origin: ["http://localhost:4200", "http://192.168.10.125:4200", "http://192.168.1.248:4200"],
  credentials: true
}));

io.on('connection', (socket) => {
    // Rejoindre un groupe (room)
    socket.on('join group', ({ groupId }) => {
        socket.join(groupId);
        socket.emit('joined', groupId);
    });

    // Envoyer un message à un groupe (broadcast à tous les membres du groupe)
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
    console.log(`Socket.io group server running at http://0.0.0.0:${PORT}`);
});