<?php
$chunk = 100;
$file_handle = fopen('points.log','r');
if (isset($_GET['p'])) {
	$p = $_GET['p'];
	$points = array();
	while ($buffer = fgets($file_handle)) {
	    $points[] = json_decode($buffer, true);
	}
	$array = array_slice($points, $p*$chunk, $chunk);
	if (!empty($array)) {
		echo json_encode($array);
	} else {
		echo json_encode(array('error' => "Out of range"));
	}
}
fclose($file_handle);