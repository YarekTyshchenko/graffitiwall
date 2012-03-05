<?php
$chunk = 100;
$file_handle = fopen('points.log','r');
if (isset($_GET['p'])) {
	$p = $_GET['p']*$chunk;
	$points = array();
	while ($buffer = fgets($file_handle)) {
	    $points[] = json_decode($buffer, true);
	}
	if (isset($points[$p])) {
		echo json_encode(array_slice($points, $p, $chunk));
	} else {
		echo json_encode(array('error' => "Out of range"));
	}
}
fclose($file_handle);