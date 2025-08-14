import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import cors from "cors"


const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.LOCALHOST_URL, process.env.PC_LOCAL_URL, process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = Number(process.env.GROUP_SOCKET_PORT);

app.use(cors({
  origin: [process.env.LOCALHOST_URL, process.env.PC_LOCAL_URL, process.env.FRONTEND_URL],
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