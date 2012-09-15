/**
 * Wall interface
 */
var WallInterface = (function() {
    var progressBar = $('div.progress div.bar');
    var progressText = $('div.progress span.text');
    var _onColorSelect = function(){};
    var _onWidthSelect = function(){};

    var _colorlist = [];
    // Populate colours
    $('#colour-selector a div').each(function(){
        _colorlist.push($(this).css('background-color'));
    });

    var _selectColor = function(index) {
        var selector = $('#colour-selector a div');
        selector.removeClass('active');
        selector.filter(function(i){
            if (i == index) {
                $(this).addClass('active');
            }
        });

        return _colorlist[index];
    }

    // On click set color
    $('#colour-selector').on('click', 'a', function(e){
        e.preventDefault();

        _onColorSelect(_selectColor($(this).parent().index()));
    });

    // On click set width
    $('#brush-selector').on('click', 'a', function(e){
        e.preventDefault();

        $('#brush-selector li').removeClass('active');
        $(this).parent().addClass('active');

        _onWidthSelect($(this).data('size'));
    });


    var _showTab = function(tabName, parent) {
        $(parent+' div.tab').removeClass('visible');
        $(parent+' div.' + tabName + '.tab').addClass('visible');
    }

    var _getProgress = function(current, total) {
        if (! total) {
            return 0;
        }
        return current / total;
    }

    return {
        showError: function() {
            _showTab('error', '#main_content');
        },
        showAbout: function() {
            _showTab('about', '#main_content');
        },
        showDraw: function() {
            _showTab('draw', '#main_content');
        },
        showTimelapse: function() {
            _showTab('timelapse', '#main_content');
            //_showTab('timelapse', '.navbar');
        },
        switchToDraw: function() {
            _showTab('draw', '.navbar');
        },
        switchToLoading: function() {
            _showTab('loading', '.navbar');
        },
        onColorSelect: function(callback) {
            _onColorSelect = callback;
        },
        onWidthSelect: function(callback) {
            _onWidthSelect = callback;
        },
        getRandomColor: function() {
            return _selectColor(Math.floor(Math.random() * _colorlist.length))
        },
        getDefaultWidth: function() {
            return $('#brush-selector li.active a').data('size');
        },
        progress: function(current, total) {
            var p = Math.round(_getProgress(current, total) * 100) + '%';
            progressBar.width(p);
            progressText.text(p);
        }
    };
});

/**
 * Canvas wrapping object
 */
var Wall = (function(canvasObject) {
    var _canvas = canvasObject;
    var _enabled = true;
    var _color;
    var _width;

    var _drawCallback = function(){};

    var _getPosition = function(e) {
        var targ;
        if (!e)
            e = window.event;
        if (e.target)
            targ = e.target;
        else if (e.srcElement)
            targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        var x = e.pageX - $(targ).offset().left;
        var y = e.pageY - $(targ).offset().top;

        return {"x": x, "y": y};
    };

    // Init
    var _click = false;
    var _p;
    _canvas.mousedown(function(e){
        e.preventDefault();

        if (_enabled) {
            _click = true;
            _p = _getPosition(e);
            var data = {
                x1: _p.x,
                y1: _p.y,
                x2: _p.x,
                y2: _p.y,
                width: _width,
                color: _color
            };
            _canvas.draw(data);
            _drawCallback(data);
        }
    });
    $(window).mouseup(function(e){
        _click = false;
    });

    _canvas.mousemove(function(e){
        e.preventDefault();

        if (_click && _enabled) {
            var np = _getPosition(e);
            var data = {
                x1: np.x,
                y1: np.y,
                x2: _p.x,
                y2: _p.y,
                width: _width,
                color: _color
            };
            _canvas.draw(data);
            _drawCallback(data);
            _p = np;
        }
    });

    return {
        clear: function() {
            _canvas.clear();
        },
        resizeToElement: function(element, callback) {
            _canvas.resizeToElement(element, callback, 1000);
        },
        draw: function(data) {
            _canvas.draw(data);
        },
        setColor: function(c) {
            _color = c;
        },
        setWidth: function(w) {
            _width = w;
        },
        setDrawCallback: function(callback) {
            _drawCallback = callback;
        },
        enable: function() {
            _enabled = true;
        },
        disable: function() {
            _enabled = false;
        }
    };
});

var CanvasObject = (function(ctx){
    var _canvasElement = ctx;
    var _context = ctx[0].getContext('2d');

    var __draw = function(x1, y1, x2, y2, width, color) {
        _context.fillStyle = color;
        _context.strokeStyle = color;
        _context.lineWidth = width*2;

        _context.beginPath();
        _context.moveTo(x2, y2);
        _context.lineTo(x1, y1);
        _context.stroke();
        _context.closePath();

        _context.beginPath();
        _context.arc(x1, y1, width, 0, Math.PI*2, true);
        _context.closePath();
        _context.fill();
    };

    var _draw = function(data) {
        __draw(
            data.x1,
            data.y1,
            data.x2,
            data.y2,
            data.width,
            data.color
        );
    };

    return {
        draw: function(data) {
            _draw(data);
        },
        clear: function() {
            _context.clearRect(
                0,
                0,
                _canvasElement.width(),
                _canvasElement.height()
            );
        },
        resizeToElement: function(element, callback, delay) {
            var resize = function(){
                // If we are making canvas bigger
                if (element.width() > _canvasElement.width() ||
                    element.height() > _canvasElement.height())
                {
                    _canvasElement.attr({
                        width: element.width(),
                        height: element.height()
                    });
                    callback();
                }
            };

            var timeout;
            $(window).resize(function() {
                if (timeout) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(resize, delay);
            });
            resize();
        },
        mousemove: function(callback) {
            _canvasElement.mousemove(callback);
        },
        mousedown: function(callback) {
            _canvasElement.mousedown(callback);
        }
    };
});