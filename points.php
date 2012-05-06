<?php

define('TYPE', 'jpeg');

$imagecreate = 'imagecreatefrom'.TYPE;

$savedImageData = getSavedImage();
if (!empty($_POST['data'])) {
    // inflate this data
    // gzinflate();
    $postImageData = $_POST['data'];
} else {
    $postImageData = null;
}

// Both Saved and POST are missing
if (!$postImageData && !$savedImageData) {
    // Both images are missing, crash
    exit;
}

// Saved is missing, POST is present
if (!$savedImageData) {
    $postImage = imagecreatefrompng(str_replace('data:', 'data://', trim($postImageData)));

    $renderedImage = 'data:image/'.TYPE.';base64,'.base64_encode(trim(getImage($postImage)));
    imagedestroy($postImage);

    file_put_contents(
        'pointsData.log',
        $renderedImage.PHP_EOL,
        FILE_APPEND
    );
    echo $renderedImage;
    exit;
}

// POST is missing, Saved is present
if (!$postImageData) {
    echo $savedImageData;
    exit;
}

// POST and Saved are present

// Create an image form post
$postImage = imagecreatefrompng(str_replace('data:', 'data://', trim($postImageData)));
$postImageSize = array(
    'x' => imagesx($postImage),
    'y' => imagesy($postImage)
);

// Create an image from Saved
$savedImage = $imagecreate(str_replace('data:', 'data://', trim($savedImageData)));
$savedImageSize = array(
    'x' => imagesx($savedImage),
    'y' => imagesy($savedImage)
);

// Create a blank canvas size of the biggest image
$newImageSize = array(
    'x' => max($postImageSize['x'], $savedImageSize['x']),
    'y' => max($postImageSize['y'], $savedImageSize['y'])
);
$newImage = imagecreatetruecolor($newImageSize['x'], $newImageSize['y']);
if (TYPE === 'png') {
    imagesavealpha($newImage, true);
    $alpha_colour = imagecolorallocatealpha($newImage, 0, 0, 0, 127);
    imagefill($newImage, 0, 0, $alpha_colour);
} else {
    $color = imagecolorallocate($newImage, 255, 255, 255);
    imagefill($newImage, 0, 0, $color);
    imagealphablending($newImage, true);
    imagealphablending($postImage, true);
}
// Copy the saved image
imagecopy($newImage, $savedImage, 0, 0, 0, 0, $savedImageSize['x'], $savedImageSize['y']);
imagedestroy($savedImage);
// Copy the post image
imagecopy($newImage, $postImage, 0, 0, 0, 0, $postImageSize['x'], $postImageSize['y']);
imagedestroy($postImage);

$renderedImage = getImage($newImage);
imagedestroy($newImage);

$encodedImage = 'data:image/'.TYPE.';base64,'.base64_encode($renderedImage);

file_put_contents(
    'pointsData.log',
    $encodedImage.PHP_EOL,
    FILE_APPEND
);
echo $encodedImage;

// EOF

function getImage($image)
{
    $imageoutput = 'image'.TYPE;
    ob_start();
    $imageoutput($image);
    return ob_get_clean();
}


function getSavedImage()
{
    $file_handle = fopen('pointsData.log','r');
    $image = '';
    while ($buffer = fgets($file_handle)) {
        $image = $buffer;
    }

    $savedImageData = str_replace('data:', 'data://', trim($image));
    fclose($file_handle);
    return $savedImageData;
}