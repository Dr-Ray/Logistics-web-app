const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors');
const { engine } = require('express-handlebars');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv')

dotenv.config();

// Custom Imports
const dbcon = require('./database.js');

// Functions
const app = express();

// Middlewares 
app.use(cors());
app.use(express.static(path.join(__dirname + '/public/')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'keyboard cat',
    cookie: {maxAge: 1000*60*60},
    saveUninitialized: false,
    resave: false
}));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:`http://localhost:${process.env.PORT}/`, 
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
// Client page loader links
app.get('/', (req, res)=> {
    res.redirect('/client');
});
app.get('/client', (req, res)=> {
    res.render('client/home', {layout: false});
});
app.get('/client/details', (req, res)=> {;
    res.render('client/details', {layout: false});
});
app.post('/client/track', (req, res)=> {
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
app.post('/client/package/id', (req, res)=> {
    let tracking_id = req.body.tracking_id;

    // Check database for package details;
    var query ="SELECT * FROM `package` LEFT JOIN `company_branch` ON `package`.`origin`=`company_branch`.`branch_id` LEFT JOIN `driver` ON `package`.`driver_id` = `driver`.`consignee_id` WHERE `package`.`tracking_id` = ?;";
    dbcon.query(query,[tracking_id], (err, result)=>{
        // return if error message while fetching data
        if(result.length == 0) {
            res.json({
                "success":false,
                "message":"ID deos not exist"
            });
        }else{ 
            let data = {
                "status":result[0].status,
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
                if(result == 0) {
                    res.json({
                        "success":false,
                        "result": "An error occured"
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

// Driver Links
app.get('/driver', (req, res)=> {
    res.render('driver/login', {layout: false});
});
function driver_auth (req, res, next) {
    if(req.session.user) {
        next();
    }else{
        res.redirect('/driver');
    }
}
app.get('/driver/home', driver_auth, (req, res)=> {
    res.render('driver/home', {layout: false, "driver": req.session.user});
});
app.post('/driver/id', (req, res)=> {
    let id = req.body.driver_id;
    var query = "SELECT * FROM package WHERE driver_id = ? AND status = 0";
    dbcon.query(query, [id], (err, result) => {
        if(err) {
            return res.json({
                "success":false,
                "message":err.message,
            });
        }else{
            return res.json({
                "success":true,
                "result":result
            });
        }     
            
    });

});
app.post('/driver/login', (req, res)=> {
    let { id, password } = req.body;
    dbcon.query('SELECT * FROM driver WHERE consignee_id = ? AND password = ?', [ id, password ], (err, row)=> {
        if (err) {
            res.json({
                "success":false,
                "message":"Internal server error please try again later"
            });
        }else{
            if(row.length == 0) { 
                res.json({
                    "success":false,
                    "message":"Incorrect ID or Password."
                });
            }else{
                req.session.user = row[0]
                res.json({
                    "success":true,
                    "message":""
                });
            }
        }
        
    })
});

// Admin links
app.get('/admin', (req, res)=> {
    res.render('admin/login', {layout: false});
});
function admin_auth (req, res, next) {
    if(req.session.admin) {
        next();
    }else{
        res.redirect('/admin');
    }
}
app.post('/admin/login', (req, res)=> {
    let { id, password } = req.body;
    if(id === "admin" && password == "admin") { 
        req.session.admin = {name:"admin"}
        res.json({
            "success":true,
            "message":""
        });
    }else{
        res.json({
            "success":false,
            "message":"Incorrect ID or Password."
        });
    }
});
app.get('/admin/home', admin_auth, (req, res)=> {
    res.render('admin/home', {layout: false, });
});

// admin functions
app.post('/admin/update_status', admin_auth, (req, res)=> {
    let { data } = req.body, ress = [],errr={};
    console.log(data);
    for(let i=0;i<data.length;i++) {
        let query = "UPDATE `package` SET `status` = 1 WHERE `package`.`tracking_id` = ?";
        dbcon.query(query, [data[i]], (err, result) => {
            if(err){
                return res.json({success:false, message:err.sqlMessage});
            }else{
                if(result.affectedRows) {
                    ress.push(result.affectedRows)
                }else{
                    errr['message'+i] = result.message;
                }
            }
            console.log(ress, errr);
        })
    }
    return res.status(200).json({success:true});
});
app.post('/admin/delete_package', admin_auth, (req, res)=> {
    let { data } = req.body, ress = [],err={};
    for(let i=0;i<data.length;i++) {
        let query = "DELETE FROM package WHERE `package`.`tracking_id` = ?";
        dbcon.query(query, [data[i]], (err, result) => {
            if(err){
                return res.json({success:false, message:err.sql});
            }else{
                if(result.affectedRows) {
                    ress.push(result.affectedRows)
                }else{
                    err['message'+i] = result.message;
                }
            }
        })
    }
    return res.status(200).json({success:true});
})
app.post('/admin/alldrivers', admin_auth,(req, res)=> {
    dbcon.query("SELECT name, consignee_id, status FROM `driver` LEFT JOIN `package` ON `driver`.consignee_id = `package`.driver_id", (err, result) => {
        if(err){
            return res.json({success:false, message:err.sqlMessage});
        }else{
            if(result.length > 0) {
                return res.json({"response": result});
            }else{
                return res.json({success:false,  message:result.message});
            }
        }
    });
});
app.post('/admin/allpackages', admin_auth, (req, res)=> {
    dbcon.query("SELECT * FROM package", (err, result) => {
        if(err){
            return res.json({success:false, message:err.sqlMessage});
        }else{
            if(result.length > 0) {
                return res.json({
                    "packages":result,
                    "completed":result.filter(elem => elem.status != 0)
                });
            }else{
                return res.json({success:false,  message:result.message});
            }
        }
    });
});
app.post('/admin/allbranch', admin_auth, (req, res)=> {
    dbcon.query("SELECT * FROM company_branch", (err, result) => {
        if(err){
            return res.json({success:false, message:err.sqlMessage});
        }else{
            if(result.length > 0) {
                return res.json({
                    "allbranch":result
                });
            }else{
                return res.json({success:false,  message:result.message});
            }
        }
    });
});
app.post('/admin/newpackage', admin_auth, (req, res)=> {
    let {details, sender, receiver, sender_phone, receiver_phone, driver_id, origin, destination} = req.body;
    let tracking_id = `${Math.floor(Math.random()*9999)+1000}${Math.floor(Math.random()*9999)+1000}${Math.floor(Math.random()*9999)+1000}`;
    let args = [details, sender, receiver, sender_phone, receiver_phone, driver_id, tracking_id, origin, destination];
    var query = "INSERT INTO `package` (`details`, `sender`, `receiver`, `sender_phone`, `receiver_phone`, `driver_id`, `tracking_id`, `origin`, `destination`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    dbcon.query(query, args, (err, result) => {
        if(err){
            return res.json({success:false, message:err.sqlMessage});
        }else{
            if(result.insertId) {
                return res.json({success:true, id:result.insertId});
            }else{
                return res.json({success:false, message:result.message});
            }
        }
    });
});

server.listen(process.env.PORT, ()=> {
    console.log(`server is listening at port ${process.env.PORT}`);
});