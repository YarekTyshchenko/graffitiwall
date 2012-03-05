var background = new Layer();
var control = new Layer();
var list = [];

var frames = new PointText(new Point(10, 20));
frames.font = 'monospace';
frames.content = 0;
control.addChild(frames);

var debug = new PointText(new Point(10, 30));
debug.font = 'monospace';
debug.content = 0;
control.addChild(debug);

var p = 0;
var lines = [];
var run = true;

function onFrame(event) {}

$(function(){
    runLapseFrame();
    setInterval(runLapseFrame, 50);
});

function runLapseFrame() {
    if (run) {
        // Preload more lines
        if (lines.length <= 0) {
            debug.content = 'Loading...';
            getLines();
        }
    }
    if (lines.length > 0) {
        draw(lines.shift());
    }
}

function getLines() {
    $.ajax({
        url: 'timelapse.php',
        async: false,
        dataType: 'json',
        data: {p: p},
        success: function(data) {
            if (data.error) {
                debug.content = 'End';
                run = false;
                return;
            }
            if (lines.length > 0) {
                lines = lines.concat(data);
            } else {
                lines = data;
            }
            p += 1;
            debug.content = '';
        },
        failure: function() {
            run = false;
        }
    });
};

function draw(data) {
    frames.content += 1;

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
    if (list.length > 200) {
        list.shift().remove();
    }
}