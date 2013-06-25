var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit: 2,
    queueLimit: 10,
    user: 'graffitiwall',
    database: 'graffitiwall_websocket'
});

var _getCountFrom = function(table, namespace, callback) {
    pool.getConnection(function(err, connection) {
        if (err) { console.log(err); return;}
        connection.query('SELECT count(*) as count FROM ' + table + ' WHERE namespace = ?', [namespace], function(err, result) {
            callback(connection, result[0].count);
        });
    });
};

exports.insert = function(data) {
    pool.getConnection(function(err, connection) {
        if (err) {console.log(err); return;}
        connection.query('INSERT INTO points SET ?', data, function() {
            connection.end();
        });
    });
};

exports.replay = function(callback, namespace) {
    _getCountFrom('points', namespace, function(connection, total){
        var list = [];
        var index = 0;
        connection.query(
            'SELECT x1, y1, x2, y2, width, color FROM points WHERE namespace = ? ORDER BY id ASC LIMIT 500000',
            [namespace]
        ).on('result', function(row) {
            list.push(row);
            if (list.length >= 1000) {
                index += list.length;
                callback(list, index, total, false);
                list = [];
            }
        }).on('end', function() {
            callback(list, index += list.length, total, true);
            connection.end();
        });
    });
};

exports.timelapse = function(callback, namespace){
};
