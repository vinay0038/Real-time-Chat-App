const express = require('express');
const path=require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utils/users');


const app = express();
const server = http.createServer(app);
const io=socketio(server);

app.use(express.static(path.join(__dirname,'public')));
const botName='RealmBot';

io.on('connection',socket=>{

    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        socket.emit('message',formatMessage(botName,'Welcome to ChatRealm'));

        socket.broadcast.to(user.room).emit(
            'message',
            formatMessage(botName,`${user.username} has joined  the chat`));
         
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
     });
    });

    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
    }});
});
const Port = 3000 || ProcessingInstruction.env.Port;

server.listen(Port,()=>{
    console.log(`server running on port ${Port}`)
});