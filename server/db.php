<?php
class DB {
    private $_db;

    private $_preparedInsert;
    private $_preparedChunk;

    protected function _getDb()
    {
        if (! $this->_db) {
            $mysqli = new mysqli("localhost", "graffitiwall", "", "graffitiwall_websocket");
            $this->_db = $mysqli;
        }
        return $this->_db;
    }

    protected function _getPreparedInsert()
    {
        if (! $this->_preparedInsert) {
            $db = $this->_getDb();
            $this->_preparedInsert = $db->prepare("INSERT INTO points(x1, y1, x2, y2, width, color) VALUES (?, ?, ?, ?, ?, ?)");
            if (! $this->_preparedInsert) {
                echo $db->error;
            }
        }
        return $this->_preparedInsert;
    }

    public function insert($x1, $y1, $x2, $y2, $width, $color)
    {
        $query = $this->_getPreparedInsert();
        $query->bind_param('iiiiis', $x1, $y1, $x2, $y2, $width, $color);
        $query->execute();
        return $query->error;
    }

    public function getAll()
    {
        $db = $this->_getDb();
        $result = $db->query("SELECT * FROM points ORDER BY id ASC");
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $result->close();

        return $rows;
    }

    public function getResult()
    {
        $db = $this->_getDb();
        $result = $db->query("SELECT x1, y1, x2, y2, width FROM points ORDER BY id DESC");
        return $result;
    }
}