var io = require('socket.io').listen(12346);
io.set('log level', 2);

var db = require('./db');

io.sockets.on('connection', function (socket) {

    io.sockets.emit('count', count());
    socket.on('disconnect', function () {
        io.sockets.emit('count', count()-1);
    });

    // Chat
    socket.on('message', function (a) {
        socket.broadcast.emit('message', a);
    });

    // Actual events
    socket.on('draw', function(data) {
        data.namespace = data.namespace.replace(/[^a-zA-Z0-9]/g, '');
        socket.broadcast.emit('draw', data);
        db.insert(data);
    });

    socket.on('replay', function(data) {
        var namespace = data.namespace.replace(/[^a-zA-Z0-9]/g, '');
        db.replay(function(list, index, total, end){
            socket.emit('replay', {
                data: list,
                index: index,
                total: total,
                end: end
            });
        }, namespace);
    });

    socket.on('timelapse', function(data) {
        var namespace = data.namespace.replace(/[^a-zA-Z0-9]/g, '');
        db.timelapse(function(list, index, total, end){
            socket.emit('timelapse', {
                data: list,
                index: index,
                total: total,
                end: end
            });
        }, namespace);
    })
});

function count() {
    var c=0,i;
    for(i in io.sockets.sockets)c++;
    return c;
}
