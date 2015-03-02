var oracle = require('oracle');

function myOracle() {
    var connectData = {
        hostname: "",
        port: 1521,
        database: "", // System ID (SID)
        user: "",
        password: ""
    }
    var self = this;

    oracle.connect(connectData, function (err, connection) {
        if (err) {
            console.log("Error connecting to db:", err);
            return;
        }

        self.connection =connection;
	console.log("oracle链接了...")
    })
}
exports.OracleDB = myOracle;
