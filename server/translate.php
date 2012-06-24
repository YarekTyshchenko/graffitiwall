<?php
include 'DB.php';
$points = file_get_contents('points.log');

$list = explode(PHP_EOL, $points);
$db = new DB();
foreach ($list as $line) {
	$data = json_decode($line, true);
	if (! $data) {
		continue;
	}

	$e = $db->insert(
		$data['x1'],
		$data['y1'],
		$data['x2'],
		$data['y2'],
		$data['width'],
		$data['color']
	);
	if ($e) {
		echo $e;
		die;
	}
	echo '.';
}

