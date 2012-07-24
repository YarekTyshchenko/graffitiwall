var io = require('socket.io').listen(12346);

io.sockets.on('connection', function (socket) {
  socket.on('message', function () {
    socket.send('message');
  });
  socket.on('disconnect', function () {});
});