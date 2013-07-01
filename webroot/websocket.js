$(function(){
    var canvasObject = CanvasObject($('#draw-canvas'));
    // Create graffiti wall instance
    var wall = Wall(canvasObject);
    var timelapseCanvas = CanvasObject($('#timelapse-canvas'));
    timelapseCanvas.resize($('#main_content'), function(){});
    var timelapse = Timelapse(timelapseCanvas);

    // Instansiate interface
    var wallInterface = WallInterface();

    // Set color and width callbacks and defaults
    wallInterface.onColorSelect(function(color) {
        wall.setColor(color);
    });

    wall.setColor(wallInterface.getRandomColor());

    wallInterface.onWidthSelect(function(width) {
        wall.setWidth(width);
    });

    wall.setWidth(wallInterface.getDefaultWidth());

    // Configure socket
    var socket = Socket(window.location.host, 12346);
    // Handle if server is down
    if (! socket) {
        wallInterface.showError();
        return;
    }
    socket.addCallback('count', function(count) {
        $('#connected').text(count);
    });

    // Set up socket draw callback
    socket.addCallback('draw', function(data) {
        wall.draw(data);
    });

    socket.addCallback('replay', function(response) {
        wallInterface.progress(response.index, response.total);
        for (var i = 0, length = response.data.length; i < length; i++) {
            wall.drawUnder(response.data[i]);
        }

        if (response.end) {
            wallInterface.switchToDraw();
            wallInterface.progress(0,1);
            wall.enable();
        }
    });

    timelapse.playProgress(function(i, t) {
        wallInterface.playProgress(i, t);
        //$('#debug').text([i, '/', t].join(' '));
    });

    timelapse.loadProgress(function(i, t) {
        wallInterface.progress(i, t);
    });

    timelapse.initiateLoading(function(size) {
        socket.timelapse(size);
    });

    socket.addCallback('timelapse', function(response) {
        timelapse.receive(response);
    });

    var startup = function() {
        wallInterface.switchToLoading();
        wall.disable();
        socket.replay();
    };
    // Make it resize to element size and start the wall
    wall.resizeToElement($('#main_content'), startup);

    // Set up sending draw data to server callback
    wall.setDrawCallback(function(data) {
        // Send data to socket
        socket.draw(data);
    });

    // Begin loading data
    socket.connect(startup);

    var _actionHelper = function(e, element) {
        e.preventDefault();

        $('.nav li.nav-link').removeClass('active');
        $(element).parent().addClass('active');
    };
    // Attach navbar buttons
    $('#page-selector').on('click', 'li#wall a', function(e){
        _actionHelper(e, this);

        timelapse.abort();
        wallInterface.showDraw();
        wallInterface.switchToDraw();
        wall.enable();
    }).on('click', 'li#about a', function(e) {
        _actionHelper(e, this);

        wall.disable();
        wallInterface.showAbout();
    }).on('click', 'li#timelapse a', function(e){
        _actionHelper(e, this);

        wall.disable();
        wallInterface.showTimelapse();
        timelapse.start();
    });
});

