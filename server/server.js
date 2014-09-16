var _ = require('underscore');
var io = require('socket.io').listen(12346);
io.set('log level', 2);

var Db = require('./db');

Db.connect(function(db) {
    io.sockets.on('connection', function (socket) {

        // Report disconnects
        socket.on('disconnect', function () {
            _.forEach(io.sockets.manager.roomClients[socket.id], function(joined, room) {
                io.sockets.to(room).emit('count', io.sockets.manager.rooms[room].length - 1);
            });
        });

        // Set name space and report connect count
        socket.on('namespace', function(namespace) {
            namespace = namespace.replace(/[^a-zA-Z0-9]/g, '');
            if (namespace.length < 1) {
                namespace = '/';
            }
            socket.set('namespace', namespace);
            socket.join(namespace);
            io.sockets.to(namespace).emit('count', io.sockets.clients(namespace).length);
        });

        // Actual Draw events
        socket.on('draw', function(data) {
            socket.get('namespace', function(err, namespace) {
                // Limit the width
                if (data.width > 15 || data.width < 5) {
                    data.width = 10;
                }
                data.namespace = namespace;
                data.culled = false;
                socket.broadcast.to(namespace).emit('draw', data);
                db.insert(data);
            });
        });

        socket.on('replay', function(size) {
            socket.get('namespace', function(err, namespace) {
                db.replay(namespace, size, function(list, index, total, end) {
                    socket.emit('replay', {
                        data: list,
                        index: index,
                        total: total,
                        end: end
                    });
                });
            });
        });

        socket.on('timelapse', function(data) {
            console.log(data);
            socket.get('namespace', function(err, namespace) {
                db.timelapse(namespace, data, function(list, index, total, end) {
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
});
