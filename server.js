const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors')

// Custom Imports
const dbcon = require('./database.js')
const PORT  = require('./settings.js')
// Functions
const app = express();
app.use(cors())
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:"http://localhost:3000/", 
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res)=> {
    res.sendFile(__dirname+'/templates/index.html')
});

server.listen(PORT, ()=> {
    console.log(`server is listening at port ${PORT}`)
});
