var _ = require('underscore');
var io = require('socket.io')();
var Db = require('./db');

Db.connect(function(db) {
    io.on('connection', function (socket) {
        // Report disconnects
        socket.on('disconnect', function () {
            //_.forEach(io.sockets.manager.roomClients[socket.id], function(joined, room) {
            //    io.sockets.to(room).emit('count', io.sockets.manager.rooms[room].length - 1);
            //});
        });

        // Set name space and report connect count
        socket.on('namespace', function(namespace) {
            console.log("Namespace:", namespace);
            var namespace = namespace.replace(/[^a-zA-Z0-9]/g, '');
            if (namespace.length < 1) {
                namespace = '/';
            }
            socket.join(namespace);
            socket.namespace = namespace;
            io.sockets.to(namespace).emit('count', io.sockets.sockets.length);
        });
        // Actual Draw events
        socket.on('draw', function(data) {
            // Limit the width
            if (data.width > 15 || data.width < 5) {
                data.width = 10;
            }
            data.namespace = socket.namespace;
            data.culled = false;
            socket.broadcast.to(socket.namespace).emit('draw', data);
            db.insert(data);
        });

        socket.on('replay', function(size) {
            db.replay(socket.namespace, size, function(list, index, total, end) {
                socket.emit('replay', {
                    data: list,
                    index: index,
                    total: total,
                    end: end
                });
            });
        });

        socket.on('timelapse', function(data) {
            console.log(data);
            db.timelapse(socket.namespace, data, function(list, index, total, end) {
                socket.emit('timelapse', {
                    data: list,
                    index: index,
                    total: total,
                    end: end
                });
            });
        });
    });
});
io.listen(12346);