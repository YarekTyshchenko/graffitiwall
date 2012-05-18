<?php
require('db.php');
$db = new DB();

define('TYPE', 'png');

$imagecreate = 'imagecreatefrom'.TYPE;

$savedImageData = getSavedImage();
$postImageData = getPostImage();

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

    saveImage($renderedImage);
    echo displayImage($renderedImage);
    exit;
}

// POST is missing, Saved is present
if (!$postImageData) {
    echo displayImage($savedImageData);
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
    'x' => 2560,
    'y' => 1600
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

$encodedImage = encodeImage($renderedImage);

saveImage($encodedImage);
echo displayImage($encodedImage);

// EOF

function getImage($image)
{
    $imageoutput = 'image'.TYPE;
    ob_start();
    $imageoutput($image);
    return ob_get_clean();
}

function encodeImage($data)
{
    return 'data:image/'.TYPE.';base64,'.base64_encode($data);
}


function getSavedImage()
{
    global $db;
    return $db->getLastImage();
}

function getPostImage()
{
    if (!empty($_POST['data'])) {
        // inflate this data
        // gzinflate();
        return $_POST['data'];
    }
    return;
}

function saveImage($data)
{
    global $db;
    $db->insert($data);
}

function getViewportSize()
{
    if (!empty($_POST['viewport_x']) && !empty($_POST['viewport_y'])) {
        return array(
            'x' => $_POST['viewport_x'],
            'y' => $_POST['viewport_y']
        );
    }
    return array(
            'x' => 2560,
            'y' => 1600
        );
}

function displayImage($data)
{
    global $imagecreate;
    $viewportSize = getViewportSize();
    $image = $imagecreate(str_replace('data:', 'data://', trim($data)));

    $displayImage = imagecreatetruecolor($viewportSize['x'], $viewportSize['y']);

    imagecopy($displayImage, $image, 0, 0, 0, 0, $viewportSize['x'], $viewportSize['y']);
    imagedestroy($image);

    return encodeImage(getImage($displayImage));

}