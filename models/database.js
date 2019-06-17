var mysql = require('mysql');

var connection = mysql.createConnection({
    user:"root",
    host:"localhost",
    password:"",
    database:"quoradatabase"

});

module.exports=connection;