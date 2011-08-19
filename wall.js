var background = new Layer();
var foreground = new Layer();
var control = new Layer();
var list = [];
var path = new Path();
path.strokeWidth = 30;
path.strokeJoin = 'round';
path.strokeCap = 'round';
var sessionColor = new HSBColor(0,0,Math.random());

var circle = new Path.Circle([0,0], path.strokeWidth/2)
control.addChild(circle);
circle.strokeColor = 'black';

var update = function(){
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
    });};

// On load
$(function(){
    update();
    setInterval(update, 5000);
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

var textItem = new PointText(new Point(20, 30));
textItem.fillColor = 'black';
textItem.content = 'Click to draw';

tool.minDistance = 5;
function onMouseDown(event) {
    path = path.clone();
    path.removeSegments();
    path.strokeColor = sessionColor;
    path.add(event.point);
    foreground.addChild(path);
}

function onMouseDrag(event) {
    circle.position = event.point;
    path.add(event.point);
    
    textItem.content = path.segments.length;
    
    if (path.segments.length >= 100) {
        textItem.content = 'Saving';
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
    circle.position = event.point;
}

