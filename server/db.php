<?php
class DB {
    private $_db;

    private $_preparedInsert;
    private $_preparedChunk;

    protected function _getDb()
    {
        if (! $this->_db) {
            $mysqli = new mysqli("localhost", "graffitiwall", "", "graffitiwall_main");
            $this->_db = $mysqli;
        }
        return $this->_db;
    }

    protected function _getPreparedInsert()
    {
        if (! $this->_preparedInsert) {
            $db = $this->_getDb();
            $this->_preparedInsert = $db->prepare("INSERT INTO points(data) VALUES (?)");
        }
        return $this->_preparedInsert;
    }

    protected function _getPreparedChunk()
    {
        if (! $this->_preparedChunk) {
            $db = $this->_getDb();
            $this->_preparedChunk = $db->prepare("SELECT data FROM points ORDER BY id ASC LIMIT ?, ?");
        }
        return $this->_preparedChunk;
    }

    public function insert($data)
    {
        $query = $this->_getPreparedInsert();
        $query->bind_param('s', $data);
        $query->execute();
    }

    public function getLastImage()
    {
        $db = $this->_getDb();
        $result = $db->query("SELECT id, data FROM points ORDER BY id DESC LIMIT 1");
        $row = $result->fetch_assoc();
        return $row['data'];
    }

    public function getChunk($page, $size)
    {
        $start = $page * $size;
        
        $result = $this->_getDb()->query(
            "SELECT data FROM points
            WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= created
            ORDER BY id ASC LIMIT $start, $size"
        );
        //$query = $this->_getPreparedChunk();
        //$query->bind_param('ii', $start, $size);
        //$query->execute();
        //$result = $query->get_result();

        $points = array();
        while($point = $result->fetch_array(MYSQLI_ASSOC)) {
            $points[] = $point['data'];
        }

        return $points;
    }
}