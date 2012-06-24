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

    public function delete($id)
    {
        $this->_getDb()->query("DELETE FROM points WHERE id = $id");
    }

    public function insert($x1, $y1, $x2, $y2, $width, $color)
    {
        $query = $this->_getPreparedInsert();
        $query->bind_param('iiiiis', $x1, $y1, $x2, $y2, $width, $color);
        $query->execute();
        return $query->error;
    }

    public function getAll($page)
    {
        $pageSQL = '';
        if (! is_null($page)) {
            $pageSQL = " LIMIT ".(int)$page.", 1000";
        }
        $db = $this->_getDb();
        $result = $db->query("SELECT x1, y1, x2, y2, width, color FROM points ORDER BY id ASC".$pageSQL);
        $rows = array();
        while($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $rows[] = $row;
        }
        $result->close();

        return $rows;
    }

    public function getResult()
    {
        $db = $this->_getDb();
        $result = $db->query("SELECT id, x1, y1, x2, y2, width FROM points ORDER BY id DESC");
        return $result;
    }
}