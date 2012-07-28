var mysql = require('mysql');
var connection = mysql.createConnection({
    user: 'graffitiwall',
    database: 'graffitiwall_websocket'
});

exports.insert = function(data) {
    connection.query('INSERT INTO points SET ?', data);
};

exports.replay = function(callback) {
    connection.query('SELECT count(1) as count FROM points', function(err, result) {
        var total = result[0].count;
        var query = connection.query('SELECT x1, y1, x2, y2, width, color FROM points ORDER BY id ASC');
        var list = [];
        var index = 0;
        query.on('result', function(row) {
            list.push(row);
            if (list.length >= 1000) {
                index += list.length;
                callback(list, index, total, false);
                list = [];
            }
        }).on('end', function() {
            callback(list, index += list.length, total, true);
        });
    });
};