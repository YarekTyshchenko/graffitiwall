var p = 0;
var lines = [];
var run = true;
var loading = false;
var drawing = false;
var interval = null;

var backgroundImage = new Image();
$(backgroundImage).load(function(){
    $('body').css('background', 'url("'+this.src+'") no-repeat');
});

$(function(){
    runLapseFrame();
    interva = setInterval(runLapseFrame, 50);
});

function runLapseFrame() {
    if (run) {
        // Preload more lines
        if (!loading && lines.length <= 30) {
            loading = true;
            $('#debug').text('.');
            getLines();
        }
    }
    if (lines.length > 0) {
        if (!run) {
            clearInterval(interval);
        }
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
            $('#debug').text('');
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
    backgroundImage.src = data;
}

