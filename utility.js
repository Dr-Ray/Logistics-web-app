const dbselect = (con, query) => {
    if(err) throw err;
    var query = "SELECT * FROM package WHERE tracking_id = ?";
    con.query(query, [tracking_id], (err, result) => {
        if(err) throw err;
        console.log(result);
    });
}

const id_exists = (con, id) => {
    let suc;
    var query = "SELECT * FROM package WHERE driver_id = ?";
    dbcnon.query                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       (query, [id], (err, result) => {
        if (err) throw err;
        suc = result;
        
    });
    console.log(suc)
}

module.exports = { id_exists }