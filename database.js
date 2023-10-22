const mysql = require('mysql')

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "logistics"
});

conn.connect(function(err) {
    if(err) {
        console.log(err.message)
    }else{
        console.log("Connected!");
    }
});

    let tracking_id = "232456456564";
    

module.exports = conn;