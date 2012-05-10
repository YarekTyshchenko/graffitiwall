var p = 0;
var lines = [];
var run = true;
var loading = false;
var drawing = false;
var interval = null;

var backgroundImage = new Image();
$(backgroundImage).load(function(){
    $('#main_content').css('background', 'url('+this.src+') no-repeat');
});

var progress = 0;
function getProgress() {
    progress++;
    switch(progress % 4) {
        case 0:
            return '|';
        case 1:
            return '/';
        case 2:
            return '-';
        case 3:
            return '\\';
    }
}

$(function(){
    runLapseFrame();
    interval = setInterval(runLapseFrame, 100);
});

function runLapseFrame() {
    if (run) {
        // Preload more lines
        if (!loading && lines.length <= 30) {
            loading = true;
            $('#progress').addClass('loading');
            getLines();
        }
    }
    if (lines.length > 0) {
        draw(lines.shift());
    } else {
        if (!run) {
            clearInterval(interval);
        }
    }
}

function getLines() {
    $.ajax({
        url: 'timelapse.php',
        cache: false,
        async: true,
        dataType: 'json',
        data: {p: p},
        success: function(data) {
            loading = false;
            $('#progress').removeClass('loading');

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
    $('#progress').text(getProgress());
}

