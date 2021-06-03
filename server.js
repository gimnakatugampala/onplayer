const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app)
const io = socketio(server)


// Load Static files
app.use(express.static(path.join(__dirname,'public')))


// Routes
app.get('/', function(req, res) {
    res.sendfile('index.html');
 });

//  Users array
 users = [];

// Run when client connects
io.on('connection',(socket) =>{
    // Get the player status
    socket.on('status',(msg) =>{
        console.log(msg)
        io.emit('status',msg)
    })

    // Volume Changes
    socket.on('volume',(msg) =>{
        console.log(msg)
        io.emit('volume',msg)
    })

    // Skip the progress 
    socket.on('currentTime',(msg) =>{
        console.log(msg)
        io.emit('currentTime',msg)
    })

    // Chat Feature
    socket.on('setUsername', function(data) {
        if(users.indexOf(data) > -1) {
           users.push(data);
           socket.emit('userSet', {username: data});
        } else {
           socket.emit('userExists', data + ' is on the Chat');
        }
     })

     socket.on('setUsername', function(data) {
        console.log(data);
        
        if(users.indexOf(data) > -1) {
           socket.emit('userExists', data + ' is on the Chat');
        } else {
           users.push(data);
           socket.emit('userSet', {username: data});
        }
     });
     
     socket.on('msg', function(data) {
        //Send message to everyone
        io.sockets.emit('newmsg', data);
     })
})


const port =  process.env.PORT || 3000 

server.listen(port,() => console.log(`Server connected at port : ${port}`))