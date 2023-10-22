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

    socket.on('start_Loc', (args, msg) =>{
        console.log("sending data", msg);
        io.to(args).emit("start_loc", msg);
    });
    // socket.on('end_Loc', (args, loc_args) =>{
    //     io.to(args).emit("end_loc", loc_args);
    // });

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
            res.json({
                "success":true,
                "redirect_link": '/client/details'
            });
        }        
    });
});

app.post('/package/id', (req, res)=> {
    let tracking_id = req.body.tracking_id;

    // Check database for package details;
    var query ="SELECT * FROM `package` LEFT JOIN `company_branch` ON `package`.`origin`=`company_branch`.`branch_id` LEFT JOIN `driver` ON `package`.`driver_id` = `driver`.`consignee_id` WHERE `package`.`tracking_id` = ?;";
    dbcon.query(query,[tracking_id], (err, result)=>{
        // return if error message while fetching data
        if(err) {
            res.json({
                "success":false,
                "result":err.message
            });
        }else{
            let data = {
                "sender":result[0].sender,
                "reciever":result[0].receiver,
                "driverName":result[0].name,
                "orgLoc":result[0].location,
                "orgcoords":[result[0].latitude, result[0].longitude],
                "destLoc":'',
                "destcoords":[],
            } 
    
            query ="SELECT * FROM `package` LEFT JOIN `company_branch` ON `package`.`destination`=`company_branch`.`branch_id` LEFT JOIN `driver` ON `package`.`driver_id` = `driver`.`consignee_id` WHERE `package`.`tracking_id` = ?;";
            dbcon.query(query,[tracking_id], (err, result)=> {
                if(err) {
                    res.json({
                        "success":false,
                        "result":err.message
                    });
                }else{
                    data.destLoc = result[0].location;
                    data.destcoords.push(result[0].latitude, result[0].longitude);
                    res.json({
                        "success":true,
                        "result": data
                    });
                }   
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