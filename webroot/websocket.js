var socket;

function createSocket(host){
    if(window.WebSocket)
        return new WebSocket(host);
    else if(window.MozWebSocket)
        return new MozWebSocket(host);
}

var page = 0;
function init(){
    var host = "ws://" + window.location.host + ":12345/wall";
    socket = createSocket(host);

    socket.onopen = function(msg) {
        connected = true;
        send({}, {type:'c', page:page});
        $('#connected').text('Loading...');

    };
    socket.onclose = function(msg) {
        connected = false;
        setTimeout(init, 1000);
    };
    socket.onmessage = function(msg) {
        var message = $.parseJSON(msg.data);
        if (message.meta.connected) {
           $('#connected').text(message.meta.connected);
        }

        // Quit if no data sent
        if (! message.array.length) {
            console.log('Empty message');
            return;
        }

        // If its a fast update
        if (message.meta.update) {
            $.each(message.array, function(key, data){
                draw(data.x1, data.y1, data.x2, data.y2, data.width, data.color);
            });
        } else {
            page = page + 1000;
            moreRequested = false;
            list.push.apply(list, message.array);
            // If its a standard load
            if (message.meta.progressive) {
                run = 'loadData';
                loadData();
            // or a timelapse load
            } else if (message.meta.timelapse) {
                run = 'timelapse';
                timelapse();
            }
        }
    };
}

var list = [];
var run = '';
function loadData() {
    if (run == 'loadData') {
        var data = list.shift();
        if (data) {
            draw(data.x1, data.y1, data.x2, data.y2, data.width, data.color);
                loadData();
        } else {
            send({}, {type:'c', page: page});
        }
    }
}

function timelapse() {
    if (run == 'timelapse') {
        var data = list.shift();
        if (data) {
            draw(data.x1, data.y1, data.x2, data.y2, data.width, data.color);
                setTimeout(timelapse, 1);
        } else {
            send({}, {type:'t', page: page});
        }
    }
}

function send(message, meta){
    var data = {
        meta: meta,
        data: message
    }
    if (connected) {
        socket.send(JSON.stringify(data));
    }
}

var ctx;

function point(x1, y1, x2, y2) {
    
    draw(x1, y1, x2, y2, sessionWidth, sessionColor);

    var data = {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        width: sessionWidth,
        color: sessionColor
    };
    
    send(data, {type:'d'});
}

function draw(x1, y1, x2, y2, width, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = width*2;

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x1, y1, width, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

var sessionWidth;
var sessionColor;
var colorlist = [];
var enabled = true;
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

function clearCanvas() {
    ctx.clearRect(0,0,$('#canvas').width() ,$('#canvas').height());
}

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

var p;
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
    init();

    var click = false;
    $('#canvas').mousedown(function(e){
        if (enabled) {
            click = true;
            p = getPosition(e);
            point(p.x, p.y, p.x, p.y);
        }
    });
    $(window).mouseup(function(e){
        click = false;
    });

    $('#canvas').mousemove(function(e){
        if (click && enabled) {
            var np = getPosition(e);
            point(np.x, np.y, p.x, p.y);
            p = np;
        }
    });

    // Attach timelapse and wall functions
    $('#timelapse').on('click', 'a', function(e){
        e.preventDefault();
        $(this).parent().addClass('active');
        $('#wall').removeClass('active');
        
        enabled = false;
        page = 0;
        run = 'timelapse';
        list = [];
        clearCanvas();
        timelapse();
    });

    $('#wall').on('click', 'a', function(e){
        e.preventDefault();
        if ($(this).parent().is('.active')) {
            return;
        }
        $(this).parent().addClass('active');
        $('#timelapse').removeClass('active');
        
        page = 0;
        run = 'loadData';
        list = [];
        clearCanvas();
        loadData();
        enabled = true;
    })
});

