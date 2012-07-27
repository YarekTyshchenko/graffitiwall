/*
var list = [];
var run = '';
function loadData() {
    if (run == 'loadData') {
        var data = list.shift();
        if (data) {
            wall.draw(data.x1, data.y1, data.x2, data.y2, data.width, data.color);
                loadData();
        } else {
            //send({}, {type:'c', page: page});
        }
    }
}

function timelapse() {
    if (run == 'timelapse') {
        var data = list.shift();
        if (data) {
            wall.draw(data.x1, data.y1, data.x2, data.y2, data.width, data.color);
                setTimeout(timelapse, 1);
        } else {
            //send({}, {type:'t', page: page});
        }
    }
}
 */

var wall;
var colorlist = [];
$(function(){
    // Create graffiti wall instance
    wall = Wall($('#canvas'));

    // Make it resize to element size
    wall.resizeToElement($('#main_content'));

    // Populate colours
    $('#colour-selector a div').each(function(){
        colorlist.push($(this).css('background-color'));
    });

    var selectColor = function(index) {
        var selector = $('#colour-selector a div');
        selector.removeClass('active');
        selector.filter(function(i){
            if (i == index) {
                $(this).addClass('active');
            }
        });

        return colorlist[index];
    }
    // Select random color
    wall.setColor(selectColor(Math.floor(Math.random() * colorlist.length)));

    // On click set color
    $('#colour-selector').on('click', 'a', function(e){
        e.preventDefault();

        wall.setColor(selectColor($(this).parent().index()));
    });

    // On click set width
    wall.setWidth($('#brush-selector li.active a').data('size'));
    $('#brush-selector').on('click', 'a', function(e){
        e.preventDefault();

        $('#brush-selector li').removeClass('active');
        $(this).parent().addClass('active');

        wall.setWidth($(this).data('size'));
    });

    // Configure socket
    var socket = Socket(window.location.host, 12346);
    socket.addCallback('count', function(count) {
        $('#connected').text(count);
    });

    // Set up socket draw callback
    socket.addCallback('draw', function(data) {
        wall.draw(data);
    });

    socket.addCallback('replay', function(list) {
        for (var i = 0, length = list.length; i < length; i++) {
            wall.draw(list[i]);
        }
    })

    // Load initial data
    socket.replay();

    // Set up sending draw data to server callback
    wall.setDrawCallback(function(data) {
        // Send data to socket
        socket.draw(data);
    });

    /*
    // Attach timelapse and wall functions
    $('#timelapse').on('click', 'a', function(e){
        e.preventDefault();
        $(this).parent().addClass('active');
        $('#wall').removeClass('active');

        wall.disable();
        wall.clear();
        socket.timelapse();
    });

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
    })
    */
});

