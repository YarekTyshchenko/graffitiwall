/*
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'hermes.yarekt.co.uk',
    user: 'wraith',
    password: 'K9YYCnYcDAqbZZnK',
    database: 'graffitiwall_websocket'
});

connection.query('SELECT count(*) FROM points', function(error, results, fields) {
    if (error) throw error;
    console.log(results);
    return results;
});

 */

var list = [];


exports.insert = function(data) {
    list.push(data);
};

exports.replay = function() {
    return list;
};