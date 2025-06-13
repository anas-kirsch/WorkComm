import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';



const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 10000;


const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (request, response) => {

    response.sendFile(join(__dirname, 'index.html'));



});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
});


io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


server.listen(PORT, () => {

    console.log(`server running at http://0.0.0.0:${PORT}`);
});