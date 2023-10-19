const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors')

// Custom Imports
// const { id_exists } = require('./utility');
const dbcon = require('./database.js')
const PORT  = require('./settings.js');
const path = require('path');

// Functions
const app = express();

// Middlewares 
app.use(cors());
app.use(express.static(path.join(__dirname + '/public/')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:`http://localhost:${PORT}/`, 
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {

    socket.on('intransit', (args, loc_args)=>{
        io.to(args).emit("current_loc", loc_args);
    });

    socket.on('start_Loc', (args, loc_args) =>{
        io.to(args).emit("start_loc", loc_args);
    });

    socket.on('end_Loc', (args, loc_args) =>{
        io.to(args).emit("end_loc", loc_args);
    });

    socket.on('destination-reached', (args, msg) =>{
        io.to(args).emit("package-arrived", msg);
    });

    socket.on('join', (room)=> {
        socket.join(room);
    });

    socket.on('leave', (room)=> {
        socket.leave(room);
    })
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

    // Check database if tracking number exists;
    var query = "SELECT * FROM package WHERE tracking_id = ?";
    dbcon.query(query, [tracking_id], (err, result)=>{
        // return if error message while fetching data
        if(err) {
            res.json({
                "success":false,
                "result":err.message
            });
        }else{
            // Render('')
            res.json({
                "success":true,
                "result":result[0],
                "redirect_link": '/client/details'
            });
        }        
    });
});

app.get('/driver', (req, res)=> {
    res.sendFile(__dirname+'/driver/index.html');
});
app.post('/driver/id', (req, res)=> {
    let id = req.body.driver_id;
    var query = "SELECT * FROM package WHERE driver_id = ?";
    dbcon.query(query, [id], (err, result) => {
        if(err) {
            return res.json({
                "success":false,
                "message":err.message,
            });
        }else{
            return res.json({
                "success":true,
                "result":result,
            });
        }     
            
    });

    // Check database if id exist

});
app.get('/admin', (req, res)=> {
    res.sendFile(__dirname+'/admin/index.html');
});


server.listen(PORT, ()=> {
    console.log(`server is listening at port ${PORT}`);
});