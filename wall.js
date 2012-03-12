
var updateDelay = 1000;
var maxPathLength = 80;

var background = new Layer();
var foreground = new Layer();
var control = new Layer();
var list = [];
var removalList = [];
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
//helpText.content = "Hold 'c' to change colour, check out /timelapse.html";
var globaldata = '';
var backgroundImage = new Image();
$(backgroundImage).load(function(){
    $('canvas').css('background', 'url("'+globaldata+'") no-repeat');
    $.each(list, function(key, item){
        item.remove();
    });
    view.draw();
});
//var backgroundRaster = new Raster(backgroundImage);
//background.addChild(backgroundRaster);


//function onFrame() {
//    helpText.content = 'l:'+list.length+' p:'+path.segments.length+' s:'+sentRequests+' '+sending;
//}

function setImage(data) {
    globaldata = data;
    backgroundImage.src = data;
    sending = false;
    
    //$('#image').attr('src', data);
    //var newImage = new Image();
    //newImage.src = data;
    //var raster = new Raster(newImage);
    
    //backgroundRaster.drawImage(newImage, 0, 0);
    
    //view.draw();
    //view.getCanvas().getContext('2d').drawImage(backgroundImage, 0, 0);
    //var raster = new Raster('image');
    //raster.position.x = 500/2;
    //raster.position.y = 200/2;
    //console.log(raster);
    //raster.position.x = view.width / 2;
    //raster.position.y = view.height / 2;

    //view.draw();
}

function displayDebug() {
    helpText.content = 'l:'+list.length+' p:'+path.segments.length+' r:'+removalList.length+' s:'+sentRequests+' '+sending;
}

var update = function() {
    displayDebug();
    $.ajax({
        url: 'points.php',
        success: function(data) {
            setImage(data);
            //$.each(list, function(key, item){
            //    item.remove();
            //});
            //foreground.removeChildren();
            /*
            $.each($.parseJSON(data), function(key, item){
                redraw(item);
            });
            */
            //view.draw();
        }
    });
};

// On load
$(function(){
    update();
    setInterval(update, updateDelay);
});


function redraw(data) {
    var newpath = new Path();
    var c = data.style.color;
    var color = new RGBColor(
        parseFloat(c.red),
        parseFloat(c.green),
        parseFloat(c.blue)
    );
    newpath.strokeColor = color;
    newpath.strokeWidth = data.style.width;
    newpath.strokeJoin = 'round';
    newpath.strokeCap = 'round';
    $.each(data.data, function(key, item){
        var point = new Point(item.x, item.y);
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
    foreground.addChild(fake);
    list.push(fake);
    foreground.addChild(path);
}

function onMouseDrag(event) {
    circle.position = event.point;
    path.add(event.point);
    displayDebug();

    if (path.segments.length >= maxPathLength) {
        // Send the path
        list.push(path);
        sendData(path);
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
    sendData(path);
}

var sending = false;
var sentRequests = 0;
function sendData(path) {
    displayDebug();

    if (sending == false) {
        sending = true;
        control.visible = false;
        view.draw();
        var data = {
            data: view.getCanvas().toDataURL()
        };
        control.visible = true;
        sentRequests++;
        $.post('points.php', data, function(response){
            setImage(response);
        });
    } else {
        console.log('Outstanding request');
    }
}

/*
function sendPath(path) {
    var result = new Array();
    $(path.segments).each(function(){
        var point = {
            x: this.getPoint().getX(), 
            y: this.getPoint().getY(),
        };
        result.push(point);
    });
    var c = path.style.getStrokeColor();
    var data = {
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
        
        $.each($.parseJSON(response), function(key, item) {
            redraw(item);
        });
    });
}
*/

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
