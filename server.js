const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors')

// Custom Imports
const dbcon = require('./database.js')
const PORT  = require('./settings.js');
const path = require('path');

// Functions
const app = express();

// Middlewares 
app.use(cors());
app.use(express.static(path.join(__dirname+'/public/')));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:`http://localhost:${PORT}/`, 
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {
    console.log('socket connected');
    socket.emit("me", socket.id);
});


// Routes
app.get('/', (req, res)=> {
    res.redirect('/client');
});
app.get('/client', (req, res)=> {
    res.sendFile(__dirname+'/client/index.html');
});
app.get('/client/details', (req, res)=> {
    res.sendFile(__dirname+'/client/details.html');
});
app.post('/track', (req, res)=> {
    let tracking_id = req.body.tracking_number;

    // Check database if tracking number exists 
    var query = "SELECT * FROM package WHERE tracking_id = ?";
    dbcon.query(query, [tracking_id], (err, result)=>{
        if(err) throw err;
        res.json({
            "success":true,
            "result":result[0],
            "redirect_link": '/client/details'
        });
    });
});

app.get('/driver', (req, res)=> {
    res.sendFile(__dirname+'/driver/index.html');
});
app.get('/admin', (req, res)=> {
    res.sendFile(__dirname+'/admin/index.html');
});



server.listen(PORT, ()=> {
    console.log(`server is listening at port ${PORT}`);
});