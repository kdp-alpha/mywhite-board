const express = require("express")
const socket = require("socket.io")

const app = express(); // initialization and server Ready
app.use(express.static("Public"))
let port = 5000;
let server = app.listen(port, ()=>{
    console.log("listening to port" + port)
})

let io = socket(server);

io.on("connection",(socket)=>{
    console.log("made socket connection")

   
    socket.on("beginPath",(data)=>{
        //data from fontend
        //Transfer all data to connected computer
        io.sockets.emit("beginPath",data)
        
    })

    socket.on("drawStroke",(data)=>{
        io.sockets.emit("drawStroke",data);
    })

    socket.on("redoUndo",(data)=>{
            io.sockets.emit("redoUndo",data)
    })

    socket.on("erasingThing",(data)=>{
        io.sockets.emit("erasingThing",data);
    })

    socket.on("clearAll",(data)=>{
        io.sockets.emit("clearAll",data)
    })
})