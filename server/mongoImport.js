var mysql = require('mysql');
var pool  = mysql.createPool({
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    connectionLimit: 2,
    queueLimit: 10,
    //user: 'graffitiwall',
    user: 'root',
    password: 'root',
    database: 'graffitiwall_main'
    //database: 'graffitiwall_websocket'
});

var _getCountFrom = function(table, callback) {
    pool.getConnection(function(err, connection) {
        if (err) { console.log(err); return;}
        connection.query('SELECT count(*) as count FROM ' + table, function(err, result) {
            callback(connection, result[0].count);
        });
    });
};

var replay = function(insertCallback, endCallback) {
    _getCountFrom('points', function(connection, total){
        var index = 0;
        connection.query(
            'SELECT x1, y1, x2, y2, namespace, width, color, created FROM points ORDER BY id ASC'
        ).on('result', function(row) {
            // Insert into mongo
            insertCallback(row);
        }).on('end', function() {
            // Done
            connection.end();
            endCallback();
        });
    });
};

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017/graffitiwall', {db: {native_parser: true}}, function(err, db) {
    if(err) throw err;

    var collection = db.collection('points');
    replay(function(row) {
        //console.log(row);
        row.culled = false;
        collection.insert(row, function(err, docs) {
            //console.log(docs);
        });
    }, function() {
        console.log('Done');
        //db.close();
        //process.exit();
    });
});