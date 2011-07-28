<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Graffiti Wall</title>
    <style>
    body {
        margin: 0;
        overflow: hidden;
    }
    </style>
    <script type="text/javascript" src="paper.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
    <script type="text/paperscript" canvas="canvas">
        var list = [];
        var path;
        var update = function(){
            $.ajax({
                url: 'test.php',
                success: function(data) {
                    refreshData(data);
                }
            });};
        
        
        $(function(){
            update();
            setInterval(update, 1000);
        });
        
        function refreshData(data) {
            $(list).each(function(){
                this.remove();
            });
            $(JSON.parse(data)).each(function(){
                newpath = new Path();
                newpath.strokeColor = 'black';
                newpath.strokeWidth = 10;
                newpath.strokeJoin = 'round';
                newpath.strokeCap = 'round';
                $(this).each(function(){
                    point = new Point(this.x, this.y);
                    newpath.add(point);
                });
                list.push(newpath);
            });
            view.draw();
        }
        
        var textItem = new PointText(new Point(20, 30));
        textItem.fillColor = 'black';
        textItem.content = 'Click to draw';
        
        //tool.minDistance = 10;
        function onMouseDown(event) {
            path = new Path();
            path.strokeColor = 'black';
            path.strokeWidth = 10;
            path.strokeJoin = 'round';
            path.strokeCap = 'round';
            path.add(event.point);
        }

        function onMouseDrag(event) {
            path.add(event.point);
            //path.smooth();
            textItem.content = path.segments.length;
            
            if (path.segments.length >= 100) {
                textItem.content = 'Saving';
                // Send the path
                list.push(path);
                sendPath(path);
                path = new Path();
                path.strokeColor = 'black';
                path.strokeColor = 'black';
                path.strokeWidth = 10;
                path.strokeJoin = 'round';
                path.strokeCap = 'round';
                path.add(event.point);
            }
        }

        function onMouseUp(event) {
            // Send data
            list.push(path);
            sendPath(path);
        }
        
        function sendPath(path) {
            result = new Array();
            $(path.segments).each(function(){
                point = {x: this.getPoint().getX(), y: this.getPoint().getY() };
                result.push(point);
            });
            
            $.post('test.php', {data:result}, function(data){
                refreshData(data);
            });
        }
        
        
    </script>
    <script type="text/javascript">

      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-23748117-2']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>
</head>
<body>
    <canvas id="canvas" resize keepalive="true"></canvas>
</body>
</html>
