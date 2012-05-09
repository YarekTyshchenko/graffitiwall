<?php
require('db.php');
$db = new DB();

header('Content-Type: image/png');
echo file_get_contents($db->getLastImage());