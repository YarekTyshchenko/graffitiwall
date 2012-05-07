var updateDelay = 1000;

// Attach color event handlers
$('#colour-selector').on('click', 'a', function(event){
    selectColor($(this).parent().index());
});

var background = new Layer();
var foreground = new Layer();
var control = new Layer();

// Please refactor me
var list = [];
var fakeList = [];

var pack = [];
var fakePack = [];

var path = new Path();
path.strokeWidth = 30;
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
$(backgroundImage).load(function(){
    $('canvas').css('background', 'url('+this.src+') no-repeat');
    view.draw();
    freeList(pack);
    
    $.each(fakePack, function(key, circle){
        circle.remove();
    });
    fakePack.length = 0;
});

function freeList(list) {
    $.each(list, function(key, value){
        value.removeSegments();
    });
    list.length = 0;
}

function setImage(data) {
    backgroundImage.src = data;
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
    path.add(event.point);
    var fake = fakeCircle.clone();
    fake.position = event.point;
    fake.fillColor = sessionColor;
    fake.visible = true;
    foreground.addChild(fake);
    foreground.addChild(path);
    
    fakeList.push(fake);
    list.push(path);
}

function onMouseDrag(event) {
    circle.position = event.point;
    path.add(event.point);
}

function sendPath() {
    if (sending == false) {
        $('#debug').text('.');
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

            $.each(fakeList, function(key, circle){
                fakePack.push(circle);
            });
            fakeList.length = 0;
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
    displayDrawingPointer(event);
}

function displayDrawingPointer(event) {
    circle.visible = true;
    circle.position = event.point;
}
