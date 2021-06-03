const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

// Load Static files
app.use(express.static(path.join(__dirname,'public')))

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
})


const port = 3000 || process.env.PORT

server.listen(port,() => console.log(`Server connected at port : ${port}`))