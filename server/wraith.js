var async = require('async');
var Db = require('./db');
var Canvas = require('canvas');

var __draw = function(_context, x1, y1, x2, y2, width) {
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

var _findItemBounds = function(x1, y1, x2, y2, width) {
    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var w = Math.max(x1, x2) - x;
    var h = Math.max(y1, y2) - y;
    // Magic numbers to try to make the bounds a little bigger than they are
    return {
        x: x - width - 1,
        y: y - width - 1,
        w: w + width + 2,
        h: h + width + 2
    };
};

var _checkBuffer = function(buffer, modifiedBuffer) {
    var bufferLength = buffer.length;
    for(var c = 0; c <= bufferLength; c++) {
        if (buffer[c] !== modifiedBuffer[c]) return false;
    }
    return true;
};

Db.connect(function(db) {
    var tasks = [];
    db.getNamespaces(function(namespace, width, height) {
        var _getCanvas = function() {
            var cache;
            return function() {
                if (cache) return cache;
                console.log(
                    ['Creating canvas for:', namespace, 'with size:', width, height].join(' ')
                );
                var canvas = new Canvas(width,height);
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'black';
                ctx.globalCompositeOperation = 'destination-over';
                cache = {ctx: ctx, canvas: canvas};
                return cache;
            };
        }();

        var i = 0;
        var culled = 0;
        tasks.push(function(callback) {
            db.getPoints(namespace, function(item, total) {
                var b = _findItemBounds(item.x1, item.y1, item.x2, item.y2, item.width);

                // Record state of canvas before drawing
                var buffer = _getCanvas().ctx.getImageData(b.x, b.y, b.w, b.h).data;
                // Draw item onto buffer
                __draw(_getCanvas().ctx, item.x1, item.y1, item.x2, item.y2, item.width);

                // Check if the canvas has changed.
                var modifiedBuffer = _getCanvas().ctx.getImageData(b.x, b.y, b.w, b.h).data;
                if (_checkBuffer(buffer, modifiedBuffer)) {
                    // Cull the item
                    db.cull(item._id);
                    culled++;
                }

                // Report stats
                if (++i % 1000 === 0) {
                    console.log([i, '/', total, '[' + namespace + ']', 'culled:', culled, 'objects'].join(' '));
                    culled = 0;
                }
            }, function() {
                callback();
            });
        });
    }, function(){
        async.series(tasks, function(){
            console.log('All tasks done');
            db.close();
        });
    });
});