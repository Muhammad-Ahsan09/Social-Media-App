const {Server} = require("socket.io")
const http = require('http')

const express = require("express")
const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    }
})

const userSocketMap = {}

io.on("connection", (socket) => {

    try {
        socket.on("user-connected", (currentUserId) => {
            // console.log(`SocketId: ${socket.id}, UserID: ${currentUserId}`)
            if(currentUserId !== 'undefined'){
                userSocketMap[currentUserId] = socket.id
            }
        })
        
        socket.on("send-message", (message, sender_id, friend_id) => {
            io.to(userSocketMap[friend_id]).emit("recieve-message", {message, sender_id})  
        })

        
        
    } catch (error) {
        console.log(error.message)
    }
    
})

module.exports = {app, io, server};



