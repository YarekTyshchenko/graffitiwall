<?php
include 'db.php';

class Handler extends WebSocketUriHandler{
	protected $_db;

	public function onMessage(IWebSocketConnection $currentUser, IWebSocketMessage $msg){
		$parts = explode("\xff\x00", $msg->getData());
		$messages = array();
		foreach ($parts as $part) {
			$data = json_decode($part, true);
			switch ($data['meta']['type']) {
				case 'd':
					$this->_saveData($data['data']);
					$messages[] = $data['data'];
					break;
				case 'c':
					$currentUser->sendString($this->_getData($data['meta']['page']));
					break;
				case 't':
					$currentUser->sendString($this->_timelapse($data['meta']['page']));
					break;
			}
		}
		if (! count($messages)) {
			return;
		}

		$packed = json_encode(array(
			'meta' => array(
				'connected' => count($this->users),
				'update' => true
			),
			'array' => $messages
		));
		
		foreach($this->users as $user){
			if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			}
		}

		// Draw on image
		// Save image
	}

	public function onDisconnect(IWebSocketConnection $currentUser)
	{
		$packed = json_encode(array(
			'meta' => array(
				'connected' => count($this->users),
				'disconnect' => true
			),
			'array' => array()
		));
		foreach($this->users as $user){
			if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			}
		}
	}

	public function onConnect(IWebSocketConnection $currentUser)
	{
		$packed = json_encode(array(
			'meta' => array(
				'connected' => count($this->users),
				'update' => true
			),
			'array' => array()
		));
		foreach($this->users as $user){
			if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			}
		}
	}

	private function _getData($page)
	{
		$output = json_encode(array(
			'meta' => array(
				'connected' => count($this->users),
				'progressive' => true
			),
			'array' => $this->_getDb()->getAll($page)
		));

		return $output;
	}

	private function _timelapse($page)
	{
		$output = json_encode(array(
			'meta' => array(
				'connected' => count($this->users),
				'timelapse' => true
			),
			'array' => $this->_getDb()->timelapse($page, 1000)
		));

		return $output;
	}

	private function _saveData($data)
	{
		if ($data['width'] < 3 || $data['width'] > 20) {
			$data['width'] = 10;
		}
		$this->_getDb()->insert(
			$data['x1'],
			$data['y1'],
			$data['x2'],
			$data['y2'],
			$data['width'],
			$data['color']
		);
	}

	protected function _getDb()
	{
		if (! $this->_db) {
			$this->_db = new DB();
		}
		return $this->_db;
	}
}