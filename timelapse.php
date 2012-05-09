<?php
require('db.php');

define('FILE', false);

$chunk = 30;
if (isset($_GET['p'])) {
	// p = Page
	$p = $_GET['p'];

	// container to send
	$points = array();

	if (FILE) {
		$db = new DB();
		$file_handle = fopen('pointsData.log','r');
		$i = 0;
		while ($buffer = fgets($file_handle)) {
			$i++;
			if ($i > $p*$chunk && $i <= $p*$chunk + $chunk) {
		    	$points[] = trim($buffer);
		    	$db->insert(trim($buffer));
			}
		}
		fclose($file_handle);
	} else {
		$db = new DB();
		$points = $db->getChunk($p, $chunk);
	}


	if (!empty($points)) {
		echo json_encode($points);
	} else {
		echo json_encode(array('error' => "Out of range"));
	}
}