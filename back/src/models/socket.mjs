
// import express from 'express';
// import { createServer } from 'node:http';
// import { Server } from 'socket.io';
// import { conversation, User } from '../database.mjs'; // Assure-toi que le chemin est correct

// const app = express();
// const server = createServer(app);
// const io = new Server(server);
// const PORT = 10000;

// /**
//  * @param {number} myUserId
//  * @param {number} friendUserId
//  */
// export async function startChatWithFriend(myUserId, friendUserId) {
//     // Génère un nom de chat unique (toujours dans le même ordre)
//     const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
//     const chatName = `${id1}/${id2}`;

//     // Vérifie si la conversation existe déjà
//     let conv = await conversation.findOne({
//         where: {
//             chat_name: chatName
//         }
//     });

//     // Si elle n'existe pas, crée-la
//     if (!conv) {
//         conv = await conversation.create({
//             chat_name: chatName,
//             UserId: id1,
//             friendId: id2
//         });
//     }

//     io.on('connection', (socket) => {
//         // Rejoint la room correspondant à la conversation
//         socket.join(chatName);

//         socket.on('join chat', () => {
//             socket.join(chatName);
//             socket.emit('joined', chatName);
//         });

//         socket.on('chat message', (msg) => {
//             // Diffuse le message à tous les membres de la room
//             io.to(chatName).emit('chat message', {
//                 userId: myUserId,
//                 message: msg
//             });
//         });

//         socket.on('leave chat', () => {
//             socket.leave(chatName);
//             socket.emit('left', chatName);
//         });

//         socket.on('disconnect', () => {
//             // Optionnel : notifier les autres membres
//         });
//     });
// }

// server.listen(PORT, () => {
//     console.log(`server running at http://0.0.0.0:${PORT}`);
// });







import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import { conversation } from '../database.mjs';
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../database.mjs";




const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 10000;

io.on('connection', (socket) => {
    socket.on('join chat', async ({ myUserId, friendUserId }) => {
        const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
        const chatName = `${id1}/${id2}`;

        let conv = await conversation.findOne({ where: { chat_name: chatName } });
        if (!conv) {
            conv = await conversation.create({
                chat_name: chatName,
                UserId: id1,
                friendId: id2
            });
        }

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





















// import express from 'express';
// import { createServer } from 'node:http';
// import { fileURLToPath } from 'node:url';
// import { dirname, join } from 'node:path';
// import { Server } from 'socket.io';



// const app = express();
// const server = createServer(app);
// const io = new Server(server);
// const PORT = 10000;


// /**
//  * @param {number} myUserId
//  * @param {number} friendUserId
//  */
// export async function startChatWithFriend(myUserId, friendUserId) {

//     io.on('connection', (socket) => {
//         console.log('a user connected');
//         socket.on('disconnect', () => {
//             console.log('user disconnected');
//         });
//     });

//     io.on('connection', (socket) => {
//         socket.on('chat message', (msg) => {
//             console.log('message: ' + msg);
//         });
//     });
    
    
//     io.on('connection', (socket) => {
//         socket.on('chat message', (msg) => {
//             io.emit('chat message', msg);
//         });
//     });



// }


// server.listen(PORT, () => {

//     console.log(`server running at http://0.0.0.0:${PORT}`);
// });