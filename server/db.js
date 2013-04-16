var mysql = require('mysql');
var connection = mysql.createConnection({
    user: 'graffitiwall',
    database: 'graffitiwall_websocket'
});

var _getCountFrom = function(table, callback) {
    connection.query('SELECT count(1) as count FROM ' + table, function(err, result) {
        callback(result[0].count);
    });
}

exports.insert = function(data) {
    connection.query('INSERT INTO points SET ?', data);
};

exports.replay = function(callback) {
    _getCountFrom('points', function(total){
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

exports.timelapse = function(callback){
    _getCountFrom('timelapse', function(total){
        total = 10000;
        var page = 0;
        for (var i = Math.ceil(total/1000) - 1; i >= 0; i--) {
            var query = connection.query('SELECT x1, y1, x2, y2, width, color FROM timelapse ORDER BY id ASC LIMIT ' + page + ',1000');
            page += 1000;
                console.log(page);

            var list = [];
            query.on('result', function(row) {
                list.push(row);
            }).on('end', function(){
                var end = false;
                if (page/1000 >= total) {
                    end = true;
                }
                callback(list, page/1000, total, end);
            });
        };
    });
};
