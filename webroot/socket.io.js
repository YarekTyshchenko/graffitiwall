var socket = (function(options){
    var socket;
    var messageCallback = function(message) {
        console.log(message);
    };
    var _f = {
        send: function(message) {
            socket.send(message);
        },
        setMessageCallback: function(callback) {
            if (socket) {
                socket.on('message', callback)
            }
            messageCallback = callback;
        },
        connect: function(host, port) {
            socket = io.connect('http://' + host + ':' + port);
            socket.on('connect', function(){
                socket.on('message', messageCallback);
            });
        };
        _f.connect('localhost', '12346');
        return _f;
    };
})();

socket.send('hi2');