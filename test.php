<?php
if (!empty($_POST)) {
    $points = $_POST;
    if (!empty($points)) {
        file_put_contents('points.log', json_encode($points).PHP_EOL, FILE_APPEND);
    }
}
$file_handle = fopen('points.log','r');
$points = array();
while ($buffer = fgets($file_handle)) {
    $points[] = json_decode($buffer, true);
}
$points = array_slice($points, -50);
echo json_encode($points);