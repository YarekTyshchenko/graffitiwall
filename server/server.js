var io = require('socket.io').listen(12346);

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
        updatedData = {
            meta: {
                connected: count(),
                update: true
            },
            array: [data.data]
        };

        socket.broadcast.emit('draw', updatedData);

        // Save later on
    });
});

function count() {
    var c=0,i;
    for(i in io.sockets.sockets)c++;
    return c;
}