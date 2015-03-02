var OracleDB = require('../oracleDB.js').OracleDB;
var oracle = require('oracle');
var db = new OracleDB();
exports.test=function(req, res, next){
	db.connection.execute("call procvarchar2outparam(:1,:2)", ["node", new oracle.OutParam(oracle.OCCISTRING, {size: 40})], function(err, results) {
        if (err) { console.log("Error executing query:", err); return; }
	res.render('body.html',{res:'111'}); 
    });
	
}


