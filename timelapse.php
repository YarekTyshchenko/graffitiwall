<?php
require('db.php');

$chunk = 10;
if (isset($_GET['p'])) {
	// p = Page
	$p = $_GET['p'];

	// container to send
	$db = new DB();
	$rawData = $db->getChunk($p, $chunk);

	if (empty($rawData)) {
		echo json_encode(array('error' => "Out of range"));
	}

	$container = array();
	foreach($rawData as $image) {
		$container[] = displayImage($image, $_GET['viewport_x'], $_GET['viewport_y']);
	}

	echo json_encode($container);
}


function displayImage($data, $width, $height)
{
    $viewportSize = array(
    	'x' => $width,
    	'y' => $height
    );

    $image = imagecreatefrompng(str_replace('data:', 'data://', trim($data)));

    $displayImage = imagecreatetruecolor($viewportSize['x'], $viewportSize['y']);

    imagecopy($displayImage, $image, 0, 0, 0, 0, $viewportSize['x'], $viewportSize['y']);
    imagedestroy($image);

    return encodeImage(getImage($displayImage));
}

function getImage($image)
{
    $imageoutput = 'imagepng';
    ob_start();
    $imageoutput($image);
    return ob_get_clean();
}

function encodeImage($data)
{
    return 'data:image/png;base64,'.base64_encode($data);
}