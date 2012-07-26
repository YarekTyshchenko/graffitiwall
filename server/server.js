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
        socket.broadcast.emit('draw', data);

        // Save later on
        db.insert(data);
    });

    socket.on('replay', function() {
        // send replay array
        // Loop through the list and emit the data incrementally
        var list = db.replay();
        for (var i = 0, length = list.length; i < length; i++) {
            socket.emit('draw', list[i]);
        }
    });

    /*
    socket.on('timelapse', function() {
        // Send timelapse array
        //socket.emit('timelapse', list);
        // Loop through different table's data and send
        // incrementally anyway, as 'draw'
        for (var i = 0, length = list.length; i < length; i++) {
            socket.emit('draw', list[i]);
        }

    });
     */
});

function count() {
    var c=0,i;
    for(i in io.sockets.sockets)c++;
    return c;
}