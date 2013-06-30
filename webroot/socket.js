var Socket = (function(host, port) {
    var readyCallback = function(){};
    if (typeof io === 'undefined') {
        return false;
    }
    var socket = io.connect('http://' + host + ':' + port);
    // Set up injected namespace
    if (typeof namespace == 'undefined') {
        var namespace = window.location.pathname || '/';
    }

    return {
        draw: function(data) {
            socket.emit('draw', data);
        },
        emit: function(type, data) {
            socket.emit(type, data);
        },
        addCallback: function(name, callback) {
            socket.on(name, callback);
        },
        replay: function() {
            socket.emit('replay');
        },
        timelapse: function(size) {
            socket.emit('timelapse', size);
        },
        connect: function(callback) {
            socket.on('connect', function() {
                socket.emit('namespace', namespace);
                callback();
            });
        }
    };
});
