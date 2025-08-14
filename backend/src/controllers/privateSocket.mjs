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
const PORT = Number(process.env.PRIVATE_SOCKET_PORT); //port private socket 

app.use(cors({
  origin: [process.env.LOCALHOST_URL, process.env.PC_LOCAL_URL, process.env.FRONTEND_URL],
  credentials: true
}));

io.on('connection', (socket) => {
  socket.on('join chat', ({ myUserId, friendUserId }) => {
    const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
    const chatName = `${id1}/${id2}`;
    socket.join(chatName);
    socket.emit('joined', chatName);
  });

  socket.on('chat message', ({ myUserId, friendUserId, message }) => {
    const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
    const chatName = `${id1}/${id2}`;
    io.to(chatName).emit('chat message', {
      userId: myUserId,
      message
    });
  });

  socket.on('leave chat', ({ myUserId, friendUserId }) => {
    const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
    const chatName = `${id1}/${id2}`;
    socket.leave(chatName);
    socket.emit('left', chatName);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server running at http://0.0.0.0:${PORT}`);
});