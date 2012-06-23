<?php
class Wraith
{
    // Has to be quadtree
    protected $_buffer = array();
    protected $_lines = array();
    protected $_culled = 0;

    protected function _open($file)
    {
        $lines = explode(PHP_EOL, trim(file_get_contents($file)));
        $this->_lines = array_reverse($lines);
    }

    public function cull($file, $outputFile)
    {
        $start = microtime(true);
        $this->_open($file);

        // loop through file
        foreach ($this->_lines as $key => $rawLine) {
            $line = json_decode($rawLine, true);
            $shape = $this->_shape(
                $line['x1'],
                $line['y1'],
                $line['x2'],
                $line['y2'],
                $line['width']
            );
            if ($shape) {
                $this->_output[] = $rawLine;
            } else {
                $this->_culled++;
            }
        }
        $end = microtime(true) - $start;
        echo 'Culled '. $this->_culled . ' / '.count($this->_lines).' lines in '. round($end) . ' s'.PHP_EOL;
        $a = array_reverse($this->_output);
        file_put_contents($outputFile, '');
        foreach ($a as $line) {
            file_put_contents($outputFile, $line.PHP_EOL, FILE_APPEND);
        }
    }

    protected function _drawRect($x1, $y1, $x2, $y2, $w, $output)
    {
        if ($x1 == $x2 && $y1 == $y2) {
            return;
        }
        for ($x = 0; $x <= (max($x1, $x2) + $w) - (min($x1, $x2) - $w); $x++) {
            for ($y = 0; $y <= (max($y1, $y2) + $w) - (min($y1, $y2) - $w); $y++) {
                list($d, $outside) = $this->_p($x1, $y1, $x2, $y2, $x1+$x, $y1+$y);
                if (floor($d) < $w && !$outside) {
                    $output[$x1+$x][$y1+$y] = true;
                }
            }
        }
    }

    protected function _shape($x1, $y1, $x2, $y2, $w)
    {
        //     ---.----------.----------.
        //   /    |   \      .          |
        //  |     |    |     .          |
        //  |     o----|----------------o
        //  |     |    |                |
        //   \    |   /                 |
        //     ---'---------------------'
        //  
        $mask = array();
        // draw a circle around x1 y1
        for($x = 0 - $w; $x <= $w; $x++) {
            for($y = 0 - $w; $y <= $w; $y++) {
                // check for circle intersection
                $l = sqrt(pow($x, 2) + pow($y, 2));
                if (floor($l) <= $w) {
                    $mask[$x1 + $x][$y1 + $y] = true;
                }
            }
        }
        // draw a rectangle between 1 and 2
        $this->_drawRect($x1, $y1, $x2, $y2, $w, &$mask);


        $inside = $this->_intersect($mask);
        if (! $inside) {
            return true;
        }
        return false;
    }

    protected function _intersect($shape)
    {
        $return = true;
        foreach ($shape as $x => $yarray) {
            foreach ($yarray as $y => $set) {
                if (! isset($this->_buffer[$x][$y])) {
                    $return = false;
                    $this->_buffer[$x][$y] = true;
                }
            }
        }

        return $return;
    }

    protected function _p($startX,$startY, $endX,$endY, $pointX,$pointY) {
        $r_numerator = ($pointX - $startX) * ($endX - $startX) + ($pointY - $startY) * ($endY - $startY);
        $r_denominator = ($endX - $startX) * ($endX - $startX) + ($endY - $startY) * ($endY - $startY);
        $r = $r_numerator / $r_denominator;

        $s = (($startY-$pointY) * ($endX - $startX) - ($startX - $pointX) * ($endY - $startY) ) / $r_denominator;

        $distanceLine = abs($s) * sqrt($r_denominator);
        
        $outside = false;
        if ( ($r >= 0) && ($r <= 1) ) {
           $outside = true;
        }    

        return array($distanceLine, $outside);
    }
}

if (empty($argv[1]) && empty($argv[2])) {
    echo 'Must specify two files'.PHP_EOL;
}

$wraith = new Wraith();
$wraith->cull($argv[1], $argv[2]);