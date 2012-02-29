var background = new Layer();
var foreground = new Layer();
var control = new Layer();
var list = [];
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

tool.minDistance = 2;

var helpText = new PointText(new Point(10, 20));
helpText.font = 'monospace';
helpText.content = "Hold 'c' to change colour";

var update = function() {
    $.ajax({
        url: 'test.php',
        success: function(data) {
            $.each(list, function(key, item){
                item.remove();
            });
            $.each($.parseJSON(data), function(key, item){
                redraw(item);
            });
            view.draw();
        }
    });
};

// On load
$(function(){
    update();
    setInterval(update, 2000);
});

function redraw(data) {
    newpath = new Path();
    c = data.style.color;
    color = new RGBColor(
        parseFloat(c.red),
        parseFloat(c.green),
        parseFloat(c.blue)
    );
    newpath.strokeColor = color;
    newpath.strokeWidth = data.style.width;
    newpath.strokeJoin = 'round';
    newpath.strokeCap = 'round';
    $.each(data.data, function(key, item){
        point = new Point(item.x, item.y);
        newpath.add(point);
    });
    background.addChild(newpath);
    list.push(newpath);
}


function onMouseDown(event) {
    path = path.clone();
    path.removeSegments();
    path.strokeColor = sessionColor;
    path.add(event.point);
    var fake = fakeCircle.clone();
    fake.position = event.point;
    fake.fillColor = sessionColor;
    fake.visible = true;
    foreground.addChild(path);
}

function onMouseDrag(event) {
    circle.position = event.point;
    path.add(event.point);
    
    if (path.segments.length >= 100) {
        // Send the path
        list.push(path);
        sendPath(path);
        path = path.clone();
        path.removeSegments();
        path.add(event.point);
        foreground.addChild(path);
    }
}

function onMouseUp(event) {
    // hack to leave a circle when path has one point
    if (path.segments.length == 1) {
        path.add(new Point(event.point.x+0.5, event.point.y+0.5));
    }
    // Send data
    list.push(path);
    sendPath(path);
}

function sendPath(path) {
    result = new Array();
    $(path.segments).each(function(){
        point = {
            x: this.getPoint().getX(), 
            y: this.getPoint().getY(),
        };
        result.push(point);
    });
    c = path.style.getStrokeColor();
    data = {
        data:result,
        style: {
            color: { red:c.red, green:c.green, blue:c.blue, alpha:c.alpha },
            width: path.style.getStrokeWidth(),
        },
    };
    $.post('test.php', data, function(response){
        $.each(list, function(key, item){
            item.remove();
        });
        
        parsedResponse = $.parseJSON(response);
        $.each(parsedResponse, function(key, item) {
            redraw(item);
        });
    });
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
    x = colorChooser.position.x - event.point.x;
    y = colorChooser.position.y - event.point.y;
    angle = (Math.atan2(x, y)*(180/Math.PI)+180);
    distance = (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))/50);
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
