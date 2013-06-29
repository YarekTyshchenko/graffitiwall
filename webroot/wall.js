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
    };

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
    };

    var _getProgress = function(current, total) {
        if (! total) {
            return 0;
        }
        return current / total;
    };

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
            _showTab('loading', '.navbar');
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
            return _selectColor(Math.floor(Math.random() * _colorlist.length));
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
 * Drawing Wall object
 */
var Wall = (function(canvasObject) {
    var _canvas = canvasObject;
    var _enabled = false;
    var _color;
    var _width;

    var _drawCallback = function(){};

    // Init
    var _click = false;
    var _p;
    _canvas.mousedown(function(p){
        if (_enabled) {
            _click = true;
            _p = p;
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
    _canvas.mouseup(function(e){
        _click = false;
    });

    _canvas.mousemove(function(np){
        if (_click && _enabled) {
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

    // Prevent scrolling of the entire body
    document.body.addEventListener('touchmove', function(event){
        event.preventDefault();
    }, false);

    return {
        clear: function() {
            _canvas.clear();
        },
        resizeToElement: function(element, callback, delay) {
            var timeout;
            $(window).resize(function() {
                if (timeout) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(function() {
                    _canvas.resize(element, callback);
                }, delay);
            });
            // Do it now
            _canvas.resize(element);
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

/**
 * Timelapse Display object
 */
var Timelapse = (function(CanvasObject){
    var _canvas = CanvasObject;

    var _frames = [];

    var _progressCallback = function(){};

    return {
        receive: function(data) {
            // append data to _frames
            for (var i = 0, length = data.length; i < length; i++) {
                _frames.push(data[i]);
            }
            console.log(_frames.length);

        },
        start: function() {
            _canvas.clear();
            // Start the animation from _frames;
            var anim = function() {
                var frame = _frames.pop();
                _canvas.draw(frame);

                setTimeout(anim, 1);
            };
            anim();
        },
        progressCallback: function(callback) {
            _progressCallback = callback;
        }
    };
});

/**
 * Canvas Wrapping object
 */
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

    var _getPosition = function(e) {
        var targ;
        if (!e)
            e = window.event;
        if (e.target)
            targ = e.target;
        else if (e.targetTouches) {
            return {
                x: e.targetTouches[0].pageX,
                y: e.targetTouches[0].pageY
            };
        } else if (e.srcElement)
            targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        var x = e.pageX - $(targ).offset().left;
        var y = e.pageY - $(targ).offset().top;

        return {x: x, y: y};
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
        resize: function(element, callback) {
            callback = callback || function(){};
            if (element.width() > _canvasElement.width() ||
                element.height() > _canvasElement.height())
            {
            // If we are making canvas bigger fire callback
                _canvasElement.attr({
                    width: element.width(),
                    height: element.height()
                });
                callback();
            }
        },
        mousemove: function(callback) {
            _canvasElement.mousemove(function(e) {
                e.preventDefault();

                var p = _getPosition(e);
                callback(p);
            });

            _canvasElement[0].addEventListener('touchmove', function(event) {
                // Try to capture all touch events
                var touches = [];
                var i, len = event.targetTouches.length;
                for (i = 0; i < len; i++) {
                    touches.push({
                        id: i,
                        x: event.targetTouches[i].pageX,
                        y: event.targetTouches[i].pageY
                    });
                }
                callback(touches[0]);
            }, false);
        },
        mousedown: function(callback) {
            _canvasElement.mousedown(function(e) {
                e.preventDefault();

                var p = _getPosition(e);
                callback(p);
            });
            _canvasElement[0].addEventListener('touchstart', function(event) {
                var p = _getPosition(event);
                callback(p);
            });
        },
        mouseup: function(callback) {
            $(window).mouseup(callback);
            _canvasElement[0].addEventListener('touchend', function(e) {
                callback(e);
            });
        }
    };
});