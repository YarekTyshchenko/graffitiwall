var p = 0;
var lines = [];
var run = true;
var loading = false;
var drawing = false;

var backgroundImage = new Image();
$(backgroundImage).load(function(){
    $('body').css('background', 'url("'+this.src+'") no-repeat');
    drawing = false;
});

$(function(){
    runLapseFrame();
    setInterval(runLapseFrame, 50);
});

function runLapseFrame() {
    if (run) {
        // Preload more lines
        if (!loading && lines.length <= 30) {
            loading = true;
            getLines();
        }
    }
    if (!drawing && lines.length > 0) {
        draw(lines.shift());
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
    drawing = true;
    backgroundImage.src = data;
}

