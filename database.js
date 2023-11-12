const mysql = require('mysql')

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "logistics",
    multipleStatements:true
});

conn.connect(function(err) {
    if(err) {
        console.log(err.message)
    }else{
        console.log("Connected!");
    }
});

module.exports = conn;