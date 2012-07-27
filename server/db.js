var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'hermes.yarekt.co.uk',
    user: 'wraith',
    password: 'K9YYCnYcDAqbZZnK',
    database: 'graffitiwall_testing'
});

exports.insert = function(data) {
    connection.query('INSERT INTO points SET ?', data);
};

exports.replay = function(callback) {
    var query = connection.query('SELECT x1, y1, x2, y2, width, color FROM points ORDER BY id ASC');
    var list = [];
    query.on('result', function(row) {
        list.push(row);
        if (list.length >= 1000) {
            callback(list, false);
            list = [];
        }
    }).on('end', function() {
        callback(list, true);
    });
};