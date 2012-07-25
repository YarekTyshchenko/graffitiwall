var io = require('socket.io').listen(12346);
var list = [];
io.sockets.on('connection', function (socket) {

    io.sockets.emit('count', count());
    socket.on('disconnect', function () {
        io.sockets.emit('count', count()-1);
    });


    // Actual events
    socket.on('message', function (a) {
        socket.broadcast.emit('message', a);
    });

    socket.on('draw', function(data) {
        socket.broadcast.emit('draw', data.data);

        // Save later on
        list.push(data.data);
    });

    socket.on('replay', function(page) {
        // send replay array
        socket.emit('replay', list);
    });
    socket.on('timelapse', function(page) {
        // Send timelapse array
        socket.emit('timelapse', list);
    });
});

function count() {
    var c=0,i;
    for(i in io.sockets.sockets)c++;
    return c;
}