// node server to handle all socket connections
// import { createServer } from "http";
const express = require("express");
const app = express();
const server = require("http").createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "https://schat-soumya19.netlify.app",
        methods: ["GET", "POST"],
        credentials: true
    },
});
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.write(`<h1>Socket.io server is running on : ${PORT}</h1>`);
    res.end();
});

// const io = require('socket.io')(8000, {
//     cors: {
//       origin: 'https://schat-soumya19.netlify.app',
//     },
// }); // we are taking the port 8000, one can take any port.
// // const httpServer = createServer();

let users = {}; // for all the users that are connected with our server.
let members = {}; // for all the members that are created.
let roomOf = {}; // for all the rooms that are created.

// we are running a socket.io server, which is an instance of HTTP.
// 'io.on' is a socket.io instance, which shall listen to multiple socket connections
// 'socket.on' means, whenever something happens with a particular connection, it shall chack if that connection is a new connection or an existing connection, i.e, if the event is 'new-user-joined' or 'send' or 'user-left'
 io.on('connection', (socket) => { // whenever you get a connection, run the following arrow function.
    socket.on('new-user-joined', (name, room) => { // if the event is 'new-user-joined', then run the following arrow function.
            if(members[room] === undefined || members[room] === null)
            {
                members[room] = [socket.id];
                roomOf[socket.id] = room;
                socket.join(room);
            }
            else
            {
                members[room].push(socket.id);
                roomOf[socket.id] = room;
                socket.join(room);
            }
            users[socket.id]= name; // give the user a key, called socket.id
            socket.to(room).emit('user-joined', name); // we need to let the others know that someone has joined the chat.
        console.log("New User : ", name, "User ID : ", socket.id, "Room : ", room);
    });

    socket.on('send', (message) => { // if the event is 'send', then run the following arrow function.
        socket.to(roomOf[socket.id]).emit('receive', {message: message, name: users[socket.id]}); // we need to let the others know that someone has sent a message, the event emmited is 'receive'
        console.log(members[roomOf[socket.id]]);
    });

    socket.on('disconnect', (message) => { // if the event is 'disconnect', then run the following arrow function.
        socket.to(roomOf[socket.id]).emit('left', users[socket.id]); // we need to let the others know that someone has left the chat.
        delete users[socket.id]; // delete the user from the users object.

        const idx = members[roomOf[socket.id]].indexOf(socket.id);
        console.log("Members in room : ", members[roomOf[socket.id]]);
        if (idx > -1)
        {
            members[roomOf[socket.id]].splice(idx, 1);
        }
        console.log("Members left in  room ", roomOf[socket.id], " : ", members[roomOf[socket.id]]);
        
        if(members[roomOf[socket.id]].length === 0)
        {
            delete members[roomOf[socket.id]];
        }
        delete roomOf[socket.id];
    });
});

server.listen(PORT, () => {
    console.log("Server is running on port 8000");
});