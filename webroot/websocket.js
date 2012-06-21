var socket;

function createSocket(host){
    if(window.WebSocket)
        return new WebSocket(host);
    else if(window.MozWebSocket)
        return new MozWebSocket(host);
}

function init(messageCallback){
    var host = "ws://" + window.location.host + ":12345/wall";
    socket = createSocket(host);

    socket.onopen = function(msg) {
        // Ready
    };
    socket.onclose = function(msg) {
        // Start retrying
    };
    socket.onmessage = messageCallback;
}

function send(message){
    socket.send(JSON.stringify(message));
}

var ctx;
var list = [];
var start;

function point(x, y, join) {
    var prev = {};
    if (join) {
        line(start.x, start.y, x, y, start.width, start.color);
        prev = {
            x: start.x,
            y: start.y,
            width: start.width,
            color: start.color
        };
    }
    circle(x, y, sessionWidth, sessionColor);

    start = {
        x: x,
        y: y,
        width: sessionWidth,
        color: sessionColor,
        join: join,
        prev: prev
    };
    
    send(start);
}

function circle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

function line(x1, y1, x2, y2, width, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    ctx.lineWidth = width*2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}
var sessionWidth;
var sessionColor;
var colorlist = [];
function selectColor(index) {
    sessionColor = colorlist[index];

    var selector = $('#colour-selector a div');
    selector.removeClass('active');
    selector.filter(function(i){
        if (i == index) {
            $(this).addClass('active');
        }
    });
}

var resizeCanvas = function() {
    $('#canvas').attr({
        width: $('#main_content').width(),
        height: $('#main_content').height()
    });
}

var message = function(msg) {
    dataArray = $.parseJSON(msg.data);
    $.each(dataArray, function(key, data){
        $('#connected').text(data.connected);

        circle(data.x, data.y, data.width, data.color);
        if (data.join) {
            // draw line from center of newData to data
            line(data.prev.x, data.prev.y, data.x, data.y, data.prev.width, data.prev.color);
        }
    });
};

function getPosition(e) {
    var targ;
    if (!e)
        e = window.event;
    if (e.target)
        targ = e.target;
    else if (e.srcElement)
        targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;

    return {"x": x, "y": y};
};


$(function(){
    resizeCanvas();
    $(window).resize(resizeCanvas);
    sessionWidth = $('#brush-selector li.active a').data('size');
    $('#brush-selector').on('click', 'a', function(e){
        e.preventDefault();

        $('#brush-selector li').removeClass('active');
        $(this).parent().addClass('active');
        
        sessionWidth = $(this).data('size');
    });

    // Populate colours
    $('#colour-selector a div').each(function(){
        colorlist.push($(this).css('background-color'));
    });
    // Select random color
    selectColor(Math.floor(Math.random() * colorlist.length));


    // Attach color event handlers
    $('#colour-selector').on('click', 'a', function(e){
        e.preventDefault();

        selectColor($(this).parent().index());
    });

    ctx = $('#canvas')[0].getContext('2d');
    // Lets hook it all up
    init(message);


    var click = false;
    $('#canvas').mousedown(function(e){
        click = true;
        p = getPosition(e);
        point(p.x, p.y, false);
    });
    $(window).mouseup(function(e){
        click = false;
    });

    $('#canvas').mousemove(function(e){
        if (click) {
            p = getPosition(e);
            point(p.x, p.y, true);
        }
    });
});

