<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Graffiti Wall</title>
    <!--
        This site is basically @yarekt 's catnip: html5 and paper.js plaything
    -->
    <meta name="Description" content="Distributed online Graffiti Wall built with canvas, HTML5 and JavaScript paper.js, Visit to see lots of people draw in real-time on the same space ! Built by @yarekt">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            overflow: hidden;
        }
        #noScriptImage {
            max-width: none;
        }
        #canvas {
            cursor: crosshair;
        }
        
        #main_content {
            padding-top: 40px;
        }
        #colour-selector a {
            padding-left: 2px;
            padding-right: 2px;
        }
        #colour-selector a:hover div {
            border-color: black;
        }
        #colour-selector a div.active {
            border-color: white;
        }
        #colour-selector a > div {
            width: 10px;
            height: 18px;
            border: 1px solid gray;
            overflow: hidden;
        }
    </style>
    <script type="text/javascript" src="paper.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script type="text/paperscript" canvas="canvas" src='wall.js'></script>
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
    <div class="navbar navbar-fixed-top">
        <div class="navbar-inner">
            <div class="container">
                <span class='brand'>Graffiti Wall</span>
                <div class='nav-collapse'>
                    <ul class='nav'>
                        <li class='divider-vertical'></li>
                        <li class='active'>
                            <a href='index.php'>Wall</a>
                        </li>
                        <li>
                            <a href='timelapse.html'>Timelapse</a>
                        </li>
                        <li>
                            <a href='about.html'>About</a>
                        </li>
                        <li class='divider-vertical'></li>
                    </ul>
                    
                    <!--span class='navbar-text'>Connected:</span>
                    <span id='connected' class='navbar-text'>0</span-->
                    
                    <span id='debug' class='navbar-text'></span>
                    
                    <ul id='colour-selector' class='nav pull-right'>
                        <li><a href='#'><div style='background-color: #F1F1F2'></div></a></li>
                        <li><a href='#'><div style='background-color: #929497'></div></a></li>
                        <li><a href='#'><div style='background-color: #404041'></div></a></li>
                        <li><a href='#'><div style='background-color: #FBDEEF'></div></a></li>
                        <li><a href='#'><div style='background-color: #E000A7'></div></a></li>
                        <li><a href='#'><div style='background-color: #7F25CF'></div></a></li>
                        <li><a href='#'><div style='background-color: #2000BF'></div></a></li>
                        <li><a href='#'><div style='background-color: #2248E3'></div></a></li>
                        <li><a href='#'><div style='background-color: #0099DA'></div></a></li>
                        <li><a href='#'><div style='background-color: #66CCFF'></div></a></li>
                        <li><a href='#'><div style='background-color: #12E37D'></div></a></li>
                        <li><a href='#'><div style='background-color: #3CD113'></div></a></li>
                        <li><a href='#'><div style='background-color: #9E9600'></div></a></li>
                        <li><a href='#'><div style='background-color: #FFF400'></div></a></li>
                        <li><a href='#'><div style='background-color: #F26B0A'></div></a></li>
                        <li><a href='#'><div style='background-color: #EC1F2F'></div></a></li>
                        <li><a href='#'><div style='background-color: #753E33'></div></a></li>
                    </ul>
                    <ul id='brush-selector' class='nav pull-right'>
                        <li><span class='navbar-text'>Brush Size</span></li>
                        <li class='divider-vertical'></li>
                        <li><a href='#' data-size='10'>Small</a></li>
                        <li><a href='#' data-size='20'>Medium</a></li>
                        <li class='active'><a href='#' data-size='30'>Large</a></li>
                        <li class='divider-vertical'></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div id='main_content' class='row-fluid'>
        <canvas id="canvas" keepalive="true" width=500 height=200 resize>
            <img id='noScriptImage' src='last.php' alt='Latest Graffiti wall image' title='You do not have html5 canvas support'/>
        </canvas>
    </div>
</body>
</html>
