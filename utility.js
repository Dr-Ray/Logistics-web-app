const dbselect = (con, query, ) => {
    if(err) throw err;
    var query = "SELECT * FROM package WHERE tracking_id = ?";
    con.query(query, [tracking_id], (err, result)=>{
        if(err) throw err;
        console.log(result);
    });
}