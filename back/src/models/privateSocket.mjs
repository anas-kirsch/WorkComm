import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 10000;

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


























// import { createServer } from 'node:http';
// import express from 'express';
// import { Server } from 'socket.io';
// import { conversation } from '../database.mjs';
// import { Op, Sequelize } from "sequelize";
// import { sequelize } from '../database.mjs';


// const app = express();
// const server = createServer(app);
// const io = new Server(server);
// const PORT = 10000;
      
    
// io.on('connection', (socket) => {
//     socket.on('join chat', async ({ myUserId, friendUserId }) => {
//         const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
//         const chatName = `${id1}/${id2}`;

//         let conv = await conversation.findOne({ where: { chat_name: chatName } });
//         if (!conv) {
//             conv = await conversation.create({
//                 chat_name: chatName,
//                 UserId: id1,
//                 friendId: id2
//             });
//         }

//         socket.join(chatName);
//         socket.emit('joined', chatName);
//     });

//     socket.on('chat message', ({ myUserId, friendUserId, message }) => {
//         const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
//         const chatName = `${id1}/${id2}`;
//         io.to(chatName).emit('chat message', {
//             userId: myUserId,
//             message
//         });
//     });

//     socket.on('leave chat', ({ myUserId, friendUserId }) => {
//         const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
//         const chatName = `${id1}/${id2}`;
//         socket.leave(chatName);
//         socket.emit('left', chatName);
//     });
// });

// server.listen(PORT, () => {
//     console.log(`Socket.io server running at http://0.0.0.0:${PORT}`);
// });



