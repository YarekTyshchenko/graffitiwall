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
        var textItem = new PointText(new Point(20, 30));
        textItem.fillColor = 'black';
        textItem.content = 'Click to draw';
        
        var path;
        //tool.minDistance = 10;
        function onMouseDown(event) {
            path = new Path();
            path.strokeColor = 'black';
            path.add(event.point);
        }

        function onMouseDrag(event) {
            path.add(event.point);
            path.smooth();
        }

        function onMouseUp(event) {
            // Send data
        }
    </script>
</head>
<body>
    <canvas id="canvas" resize keepalive="true"></canvas>
</body>
</html>
