<?php

// Teach this to send back only a small viewport

$file_handle = fopen('pointsData.log','r');
$image = '';
while ($buffer = fgets($file_handle)) {
    $image = $buffer;
}
fclose($file_handle);
// Create an base image

if (!empty($_POST['data'])) {
    $imageData = imagecreatefrompng(str_replace('data:', 'data://', trim($image)));
    $x = imagesx($imageData);
    $y = imagesy($imageData);

    $image = trim($_POST['data']);
    // create the new image
    $newImage = imagecreatefrompng(str_replace('data:', 'data://', $image));
    $newx = imagesx($newImage);
    $newy = imagesy($newImage);
    
    // merge new image with base image
    // if the new image is larger than the base image
    //if ($x > $newx || $y > $newy) {
        $blankx = max($x, $newx);
        $blanky = max($y, $newy);
        $blank = imagecreatetruecolor($blankx, $blanky);
        
        imagesavealpha($blank, true);
        $trans_colour = imagecolorallocatealpha($blank, 0, 0, 0, 127);
        imagefill($blank, 0, 0, $trans_colour);
        
        imagecopy($blank, $imageData, 0, 0, 0, 0, $x, $y);
        imagecopy($blank, $newImage, 0, 0, 0, 0, $newx, $newy);
        imagedestroy($imageData);
        imagedestroy($newImage);
        ob_start();
        imagepng($blank);
        $rawImage = ob_get_clean();
        imagedestroy($blank);
        $image = 'data:image/png;base64,'.base64_encode($rawImage);
    //}

    // save combined image into the log
    file_put_contents('pointsData.log', $image.PHP_EOL, FILE_APPEND);
}

// send the response back as base64 string
echo trim($image);