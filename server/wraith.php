<?php
include 'db.php';

class Wraith
{
    protected $_db;

    protected $_buffer = array();

    protected $_culled = 0;
    protected $_count = 0;

    public function cull()
    {
        $db = new DB();
        $start = microtime(true);

        // loop through file
        $result = $db->getResult();
        $total = $result->num_rows;
        
        $m = memory_get_usage();
        while ($line = $result->fetch_assoc()) {
            if ($this->_count % 100 == 0) {
                echo ($this->_count) . ' ('.$this->_culled.') / ' . $total;
                echo ' Buffer '.count($this->_buffer);
                echo ' Mem: '. number_format(memory_get_usage() - $m).' bytes'.PHP_EOL;

            }
            $covered = $this->_isCovered(
                $line['x1'],
                $line['y1'],
                $line['x2'],
                $line['y2'],
                $line['width']
            );
            if ($covered) {
                $db->delete($line['id']);
                $this->_culled++;
            }
            $this->_count++;
        }
        $this->_displayBuffer();
        $result->close();
        $end = microtime(true) - $start;
        echo 'Culled '. $this->_culled . ' / '.$this->_count.' lines';
        echo ' Buffer '.count($this->_buffer);
        echo ' in '. number_format($end, 4) . ' s'.PHP_EOL;
    }

    protected function _displayBuffer()
    {
        $max_x = 0;
        $max_y = 0;
        foreach($this->_buffer as $key => $null) {
            list($x, $y) = explode(':', $key);
            $max_x = max($max_x, $x);
            $max_y = max($max_y, $y);
        }

        $width = $max_x;
        $height = $max_y;
        if (!$width || !$height) {
            return;
        }
        $i = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($i, 255, 255, 255);
        imagefilledrectangle($i,0,0,$width,$height,$white);
        $b = imagecolorallocate($i, 0, 0, 0);
        $r = imagecolorallocate($i, 255, 0, 0);

        
        foreach($this->_buffer as $key => $null) {
            list($x, $y) = explode(':', $key);
            imagesetpixel($i, $x, $y, $b);
        }

        imagepng($i, '/tmp/graph.png');
    }

    protected function _isCovered($x1, $y1, $x2, $y2, $w)
    {
        // assume that its fully covered by something else
        $return = true;
        //     ---.----------.----------.
        //   /    |   \      .          |
        //  |     |    |     .          |
        //  |     o----|----------------o
        //  |     |    |                |
        //   \    |   /                 |
        //     ---'---------------------'
        //  
        // draw a circle around x1 y1
        for($x = 0 - $w; $x <= $w; $x++) {
            for($y = 0 - $w; $y <= $w; $y++) {
                // check for circle intersection
                $l = sqrt(pow($x, 2) + pow($y, 2));
                if (floor($l) < $w) {
                    // If part of the shape doesn't exist in buffer
                    if (! $this->_existsInBuffer($x1 + $x, $y1 + $y)) {
                        // return that it can't be removed
                        $return = false;
                    }
                }
            }
        }
        // draw a rectangle between 1 and 2
        if ($x1 == $x2 && $y1 == $y2) {
            return $return;
        }

        $max_x = max($x1, $x2) + $w;
        $min_x = min($x1, $x2) - $w;
        $max_y = max($y1, $y2) + $w;
        $min_y = min($y1, $y2) - $w;
        for ($x = $min_x; $x <= $max_x; $x++) {
            for ($y = $min_y; $y <= $max_y; $y++) {
                list($d, $inside) = $this->_p($x1, $y1, $x2, $y2, $x, $y);
                if (floor($d) <= $w && $inside) {
                    if (! $this->_existsInBuffer($x, $y)) {
                        $return = false;
                    }
                }
            }
        }

        return $return;
    }

    protected function _existsInBuffer($x, $y) {
        if (isset($this->_buffer["$x:$y"]) || array_key_exists("$x:$y", $this->_buffer)) {
            return true;
        }
        $this->_buffer["$x:$y"] = null;
        return false;
    }

    protected function _p($startX,$startY, $endX,$endY, $pointX,$pointY) {
        $r_numerator = ($pointX - $startX) * ($endX - $startX) + ($pointY - $startY) * ($endY - $startY);
        $r_denominator = ($endX - $startX) * ($endX - $startX) + ($endY - $startY) * ($endY - $startY);
        $r = $r_numerator / $r_denominator;

        $s = (($startY-$pointY) * ($endX - $startX) - ($startX - $pointX) * ($endY - $startY) ) / $r_denominator;

        $distanceLine = abs($s) * sqrt($r_denominator);
        
        $inside = false;
        if ( ($r >= 0) && ($r <= 1) ) {
           $inside = true;
        }    

        return array($distanceLine, $inside);
    }
}

$wraith = new Wraith();
$wraith->cull();