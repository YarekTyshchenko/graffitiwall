<?php
$points = file_get_contents('points.log');

$list = explode(PHP_EOL, $points);

foreach ($list as $line) {
	$data = json_decode($line, true);
	if (! $data) {
		continue;
	}

	$o = array(
		'x1' => $data['x'],
		'y1' => $data['y'],
		'x2' => $data['x'],
		'y2' => $data['y'],
		'width' => $data['width'],
		'color' => $data['color'],
	);
	if (count($data['prev'])) {
		$o['x2'] = $data['prev']['x'];
		$o['y2'] = $data['prev']['y'];
	}
	file_put_contents('points2.log', json_encode($o).PHP_EOL, FILE_APPEND);
}

