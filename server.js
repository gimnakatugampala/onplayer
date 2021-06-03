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
    })

    // Skip the progress 
    socket.on('currentTime',(msg) =>{
        console.log(msg)
    })


    // // Runs when client disconnets
    // socket.on('disconnect',() =>{
    //     io.emit('left','A User has left')
    // })

    
})


const PORT = 3000 || process.env.port

server.listen(PORT,() => console.log(`Server connected at port : ${PORT}`))