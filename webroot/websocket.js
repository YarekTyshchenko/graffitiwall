$(function(){
    // Create graffiti wall instance
    var canvasObject = CanvasObject($('#canvas'));
    var wall = Wall(canvasObject);


    // Instansiate interface
    wallInterface = WallInterface();

    // Set color and width callbacks and defaults
    wallInterface.onColorSelect(function(color) {
        wall.setColor(color);
    })

    wall.setColor(wallInterface.getRandomColor());

    wallInterface.onWidthSelect(function(width) {
        wall.setWidth(width);
    })

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
            wall.draw(response.data[i]);
        }

        if (response.end) {
            wallInterface.switchToDraw();
            wall.enable();
        }
    })

    // Make it resize to element size
    wall.resizeToElement($('#main_content'), function() {
        wallInterface.switchToLoading();
        wall.disable();
        socket.replay();
    });

    // Set up sending draw data to server callback
    wall.setDrawCallback(function(data) {
        // Send data to socket
        socket.draw(data);
    });

    // Attach navbar buttons
    $('#wall').on('click', 'a', function(e){
        e.preventDefault();

        wall.enable();
        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showDraw();
    });

    $('#about').on('click', 'a', function(e) {
        e.preventDefault();

        wall.disable();
        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showAbout();
    });

    // Attach time lapse functions
    $('#timelapse').on('click', 'a', function(e){
        e.preventDefault();
        wall.disable();

        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showTimelapse();
    });
});

