<?php
usleep(10000);
$file_handle = fopen('points.log','r');
if (!empty($_GET['p'])) {
	$p = $_GET['p'];
	$points = array();
	while ($buffer = fgets($file_handle)) {
	    $points[] = json_decode($buffer, true);
	}
	if (isset($points[$p])) {
		echo json_encode($points[$p]);
	} else {
		echo json_encode(array('error' => "Out of range"));
	}
} else {
	$linecount = 0;
	while(!feof($file_handle)){
		$line = fgets($file_handle);
		$linecount++;
	}
	echo json_encode(array('lines' => $linecount));
}