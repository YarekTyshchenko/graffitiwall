<?php
if (!empty($_POST['data'])) {
    $points = $_POST['data'];
    file_put_contents('points.log', serialize($points).PHP_EOL, FILE_APPEND);
}
$file_handle = fopen('points.log','r');
$points = array();
while ($buffer = fgets($file_handle)) {
    $points[] = unserialize($buffer);
}
echo json_encode($points);