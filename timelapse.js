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
var loading = false;

function onFrame(event) {}

$(function(){
    runLapseFrame();
    setInterval(runLapseFrame, 50);
});

function runLapseFrame() {
    if (run) {
        // Preload more lines
        if (!loading && lines.length <= 50) {
            debug.content = 'Loading...';
            loading = true;
            getLines();
        }
    }
    if (lines.length > 0) {
        draw(lines.shift());
    } else {
        debug.content = 'End';
    }
}

function getLines() {
    $.ajax({
        url: 'timelapse.php',
        async: true,
        dataType: 'json',
        data: {p: p},
        success: function(data) {
            loading = false;
            debug.content = '';
            if (data.error) {
                run = false;
                return;
            }
            
            // Append to lines store unless its empty
            if (lines.length > 0) {
                lines = lines.concat(data);
            } else {
                lines = data;
            }
            p += 1;
        },
        error: function() {
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