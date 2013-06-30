$(function(){
    var canvasObject = CanvasObject($('#draw-canvas'));
    // Create graffiti wall instance
    var wall = Wall(canvasObject);
    //var timelapseCanvas = CanvasObject($('#timelapse-canvas'));
    //timelapseCanvas.resize($('#main_content'), function(){});
    //var timelapse = Timelapse(timelapseCanvas);

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
            wall.enable();
        }
    });

    //timelapse.progressCallback(function(i, t) {
    //    wallInterface.progress(i, t);
    //});

    //socket.addCallback('timelapse', function(response){
    //    timelapse.receive(response.data);
    //});

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

    // Attach navbar buttons
    $('#page-selector').on('click', 'li#wall a', function(e){
        e.preventDefault();

        wall.enable();
        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showDraw();
    }).on('click', 'li#about a', function(e) {
        e.preventDefault();

        wall.disable();
        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showAbout();
    // }).on('click', 'li#timelapse a', function(e){
    //     e.preventDefault();
    //     wall.disable();

    //     $('.nav li.nav-link').removeClass('active');
    //     $(this).parent().addClass('active');
    //     wallInterface.showTimelapse();
    //     socket.timelapse();
    //     timelapse.start();
    });
});

