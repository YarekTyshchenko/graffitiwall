var updateDelay = 2000;

// Attach color event handlers
$('#colour-selector').on('click', 'a', function(e){
    e.preventDefault();

    selectColor($(this).parent().index());
});

var sessionWidth = 30;
$('#brush-selector').on('click', 'a', function(e){
    e.preventDefault();

    $('#brush-selector li').removeClass('active');
    $(this).parent().addClass('active');
    
    sessionWidth = $(this).data('size');
    circle.fitBounds(new Size(sessionWidth));
    fakeCircle.fitBounds(new Size(sessionWidth));
});

var background = new Layer();
var foreground = new Layer();
var control = new Layer();

var list = [];

var path = new Path();
path.strokeWidth = sessionWidth;
path.strokeJoin = 'round';
path.strokeCap = 'round';

// Populate colours
var colorlist = [];
$('#colour-selector a div').each(function(){
    colorlist.push($(this).css('background-color'));
});

var sessionColor;
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

// Select random color
selectColor(Math.floor(Math.random() * colorlist.length));

var brushList = [];
$('#brush-selector a').each(function(){
    brushList.push($(this).data('size'));
});

var circle = new Path.Circle([0,0], path.strokeWidth/2);
circle.visible = false;
circle.strokeColor = 'black';
control.addChild(circle);
tool.minDistance = 1;

var fakeCircle = new Path.Circle([0,0], path.strokeWidth/2);
fakeCircle.visible = false;


var dirty = false;
var sending = false;

var backgroundImage = new Image();
//$(backgroundImage).load(function(){
//    reloadBackground(this.src, []);
//});

function reloadBackground(data, list) {
    $('canvas').css('background', 'url('+data+') no-repeat');
    view.draw();
    sending = false;
    $.each(list, function(key, path){
        path.removeSegments();
    });
    list.length = 0;
}

function setImage(data, list) {
    
    // Lambda funtion to remove list once the image is loaded
    $(backgroundImage).load(function(data, list){
        return function() {
            reloadBackground(data, list);
        }
    }(data, list));
    
    if (backgroundImage.src == data) {
        sending = false;
    } else {
        backgroundImage.src = data;
    }
    $('#debug').text(' ');
}

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
    path.strokeWidth = sessionWidth;
    path.add(event.point);
    var fake = fakeCircle.clone();
    fake.position = event.point;
    fake.fillColor = sessionColor;
    fake.visible = true;
    foreground.addChild(fake);
    foreground.addChild(path);
    
    list.push(fake);
    list.push(path);
}

function onMouseDrag(event) {
    dirty = true;
    circle.position = event.point;
    path.add(event.point);
}

function sendPath() {
    if (sending == false) {
        sending = true;
        $('#debug').text('.');
        
        var newList = [];

        var data = {
            viewport_x: view.size.width,
            viewport_y: view.size.height
        };

        if (dirty || path.segments.length > 1) {
            dirty = false;
            control.visible = false;
            view.draw();
            // deflate this string
            data.data = view.getCanvas().toDataURL();
            control.visible = true;

            // Create a new path
            lastPoint = path.lastSegment.point;
            path = new Path();
            path.strokeWidth = sessionWidth;
            path.strokeJoin = 'round';
            path.strokeCap = 'round';
            path.strokeColor = sessionColor;

            foreground.addChild(path);
            path.add(lastPoint);

            // Create new lists
            newList = list;
            list = [];
            list.push(path);
        }
        $.ajax({
            url: 'points.php',
            data: data,
            type: 'POST',
            cache: false,
            success: function(response) {
                setImage(response, newList);
            }
        });
    }
}

function onMouseMove(event) {
    displayDrawingPointer(event);
}

function displayDrawingPointer(event) {
    circle.visible = true;
    circle.position = event.point;
}
