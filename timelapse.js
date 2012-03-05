var background = new Layer();
var control = new Layer();
var list = [];

var frames = new PointText(new Point(10, 50));
frames.font = 'monospace';
frames.content = 0;
control.addChild(frames);

var frameCount = 0;
var totalLines = 0;
var noError = true;

$.ajax({
	url: 'timelapse.php',
	dataType: 'json',	
	async: false,
	success: function(data) {
		totalLines = data.lines;
	}
});

function onFrame(event) {
	//frames.content = event.time;
    frameCount += 1;
    if (totalLines && noError) {
	    update(frameCount, totalLines);
    }
}

function update(number) {
    $.ajax({
        url: 'timelapse.php',
        async: true,
        dataType: 'json',
        data: {p: number},
        success: function(data) {
            if (data.error) {
            	console.log(data.error);
            	noError = false;
            }
            draw(data);
        },
        failure: function() {
			noError = false;
        }
    });
};

function draw(data) {
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
    frames.content = list.length;
    if (list.length > 200) {
    	list.shift().remove();
    }
}