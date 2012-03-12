<?php
$chunk = 30;
if (isset($_GET['p'])) {
	$file_handle = fopen('pointsData.log','r');
	$p = $_GET['p'];
	$points = array();
	$i = 0;
	while ($buffer = fgets($file_handle)) {
		$i++;
		if ($i > $p*$chunk && $i <= $p*$chunk + $chunk) {
	    	$points[] = trim($buffer);
		}
	}
	fclose($file_handle);
	if (!empty($points)) {
		echo json_encode($points);
	} else {
		echo json_encode(array('error' => "Out of range"));
	}
}