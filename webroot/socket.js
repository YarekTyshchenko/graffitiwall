var Socket = (function(host, port, namespace){
    if (typeof io === 'undefined') {
        return false;
    }
    var socket = io.connect('http://' + host + ':' + port + '/' + namespace);
    socket.on('connect', function(){});

    return {
        send: function(message) {
            socket.emit('message', message);
        },
        draw: function(data) {
            socket.emit('draw', data);
        },
        emit: function(type, data) {
            socket.emit(type, data);
        },
        addCallback: function(name, callback) {
            socket.on(name, callback);
        },
        replay: function(softNamespace) {
            socket.emit('replay', {namespace: softNamespace});
        },
        timelapse: function() {
            socket.emit('timelapse');
        }
    };
});
