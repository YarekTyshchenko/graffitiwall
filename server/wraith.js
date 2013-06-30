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

Db.connect(function(db) {
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
        var hash;
        var i = 0;
        var culled = 0;
        db.getPoints(namespace, function(item, total) {
            // Record state of canvas before drawing
            var startX = Math.min(item.x1, item.x2);
            var startY = Math.min(item.y1, item.y2);
            var widthI = Math.max(item.x1, item.x2) - startX;
            var heightI = Math.max(item.y1, item.y2) - startY;
            var temp = _getCanvas().ctx.getImageData(
                startX - item.width,
                startY - item.width,
                widthI + item.width,
                heightI + item.width
            );
            // Draw item onto buffer
            __draw(_getCanvas().ctx, item.x1, item.y1, item.x2, item.y2, item.width);
            // Check if the canvas has changed.
            var newTemp = _getCanvas().ctx.getImageData(
                startX - item.width,
                startY - item.width,
                widthI + item.width,
                heightI + item.width
            );

            if (function(){
                for(var c = 0; c <= temp.data.length; c++) {
                    if (temp.data[c] !== newTemp.data[c]) {
                        return false;
                    }
                }
                return true;
            }()) {
                culled++;
                db.cull(item._id);
            }
            if (++i % 1000 === 0) {
                console.log([i, '/', total, namespace, 'culled:', culled, 'objects'].join(' '));
                culled = 0;
            }
        });
    });
});