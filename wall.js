
var updateDelay = 1000;
var maxPathLength = 80;

var background = new Layer();
var foreground = new Layer();
var control = new Layer();
var list = [];

var pack = [];

var path = new Path();
path.strokeWidth = 30;
path.strokeJoin = 'round';
path.strokeCap = 'round';
var sessionColor = new HSBColor(Math.random()*360,1,1);

var circle = new Path.Circle([0,0], path.strokeWidth/2);
circle.visible = false;
circle.strokeColor = 'black';
control.addChild(circle);

var fakeCircle = new Path.Circle([0,0], path.strokeWidth/2);
fakeCircle.visible = false;

var colorChooser = new Path.Circle(view.center, 50);
colorChooser.visible = false;
colorChooser.strokeColor = 'black';
colorChooser.fillColor = sessionColor;
control.addChild(colorChooser);

tool.minDistance = 1;

var helpText = new PointText(new Point(10, 20));
helpText.font = 'monospace';
helpText.content = "Hold 'c' to change colour, check out /timelapse.html";

var debug = new PointText(new Point(10, 40));
debug.font = 'monospace';
debug.content = 'debug';

function showDebug() {
    var a = 'sending: false';
    if (sending) {
        a = 'sending: true';
    }

    var b = 'dirty: false';
    if (dirty) {
        b = 'dirty: true';
    }
    helpText.content = a+' '+b+ ' ' +list.length+ ':' + path.segments.length;
}

var dirty = false;
var sending = false;

var backgroundImage = new Image();
$(backgroundImage).load(function(){
    $('canvas').css('background', 'url('+this.src+') no-repeat');
    view.draw();
    freeList(pack);
});

function freeList(list) {
    $.each(list, function(key, value){
        value.removeSegments();
    });
    list.length = 0;
}

/*
function onFrame() {
    showDebug();
}
//*/

function setImage(data) {
    backgroundImage.src = data;
    
    debug.content = '';
}

var update = function() {
    debug.content = 'u';
    $.ajax({
        url: 'points.php',
        cache: false,
        success: function(data) {
            setImage(data);
        }
    });
};

// On load
$(function(){
    sendPath();
    setInterval(sendPath, updateDelay);
});


function onMouseDown(event) {
    dirty = true;
    path = path.clone();
    path.removeSegments();
    path.strokeColor = sessionColor;
    path.add(event.point);
    var fake = fakeCircle.clone();
    fake.position = event.point;
    fake.fillColor = sessionColor;
    fake.visible = true;
    foreground.addChild(fake);
    foreground.addChild(path);
    
    list.push(path);
}

function onMouseDrag(event) {
    circle.position = event.point;
    path.add(event.point);
}

function onMouseUp(event) {
}

function sendPath() {
    if (sending == false) {
        debug.content = '.';
        sending = true;
        
        var data = {};
        if (dirty || path.segments.length > 0) {
            control.visible = false;
            view.draw();
            data = {
                // deflate this string
                data: view.getCanvas().toDataURL()
            };
            control.visible = true;

            // Create a new path
            list.push(path);
            path = path.clone();
            path.removeSegments();
            foreground.addChild(path);

            $.each(list, function(key, path){
                pack.push(path);
            });
            list.length = 0;
        }
        
        $.ajax({
            url: 'points.php',
            data: data,
            type: 'POST',
            cache: false,
            success: function(response) {
                sending = false;
                dirty = false;

                setImage(response);
            }
        });
    }
}

function onMouseMove(event) {
    if (Key.isDown('c')) {
        pickColor(event);
    } else {
        displayDrawingPointer(event);
    }
}

function pickColor(event) {
    colorPosition = colorChooser.position - event.point;
    var x = colorChooser.position.x - event.point.x;
    var y = colorChooser.position.y - event.point.y;
    var angle = (Math.atan2(x, y)*(180/Math.PI)+180);
    var distance = (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))/50);
    if (distance > 1) {
        distance = 1;
    }
    sessionColor = new HSBColor(angle,1,distance);
    colorChooser.fillColor = sessionColor;
}

function onKeyDown(event) {
    if (event.key == 'c') {
        displayColorChooser();
    }
}

function onKeyUp(event) {
    if (event.key == 'c') {
        hideColorChooser();
    }
}

function displayColorChooser() {
    if (!colorChooser.visible) {
        if (circle.visible) {
            colorChooser.position = circle.position;
        }
        circle.visible = false;
        colorChooser.visible = true;
    }
}

function hideColorChooser() {
    colorChooser.visible = false;
}

function displayDrawingPointer(event) {
    circle.visible = true;
    circle.position = event.point;
}
