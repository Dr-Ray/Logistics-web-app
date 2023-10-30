const allPackages = (con) => {
    if(err) throw err;
    var query = "SELECT * FROM package";
    con.query(query, (err, result) => {
        if(err) throw err;
        return {
            "packages":result,
            "completed":completed(result)
        }
    });
}

const allDrivers = (con) => {
    if(err) throw err;
    var query = "SELECT name FROM drivers";
    con.query(query, (err, result) => {
        if(err) throw err;
        return result
    });
}

const newPackage = (con, ...args) => {
    if(err) throw err;
    var query = "INSERT INTO `package` (`details`, `sender`, `receiver`, `sender_phone`, `receiver_phone`, `driver_id`, `tracking_id`, `status`, `origin`, `destination`, `createdAt`) VALUES ( ?, ?, ?, ?, ?, ?, ?, '0', ?, ?)";
    con.query(query, args, (err, result) => {
        if(err) throw err;
        return result
    });
}

const completed = (packages)=> {
    const newd = packages.filter(elem => elem.status != 0);
    return newd;
}

const updateStatus = (con, status, id) => {
    if(err) throw err;
    var query = "UPDATE `package` SET `status` = ? WHERE `package`.`tracking_id` = ?";
    con.query(query, [status, id] ,(err, result) => {
        if(err) throw err;
        return result
    });
}



module.exports = { allPackages, allDrivers, newPackage, updateStatus }