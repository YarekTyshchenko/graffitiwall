$(function(){
    // Create graffiti wall instance
    var wall = Wall($('#canvas'));

    // Make it resize to element size
    wall.resizeToElement($('#main_content'));

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

    // Load initial data
    wallInterface.switchToLoading();
    wall.disable();
    socket.replay();

    // Set up sending draw data to server callback
    wall.setDrawCallback(function(data) {
        // Send data to socket
        socket.draw(data);
    });

    // Attach timelapse and wall functions
    /*
    $('#timelapse').on('click', 'a', function(e){
        e.preventDefault();
        $(this).parent().addClass('active');
        $('#wall').removeClass('active');

        wall.disable();
        wall.clear();
        //socket.timelapse();
    });
    */

    /*
    $('#wall').on('click', 'a', function(e){
        e.preventDefault();

        // Prevent reloading
        if ($(this).parent().is('.active')) {
            return;
        }
        $(this).parent().addClass('active');
        $('#timelapse').removeClass('active');

        wall.clear();
        socket.replay();
        wall.enable();
    });
     */
});

