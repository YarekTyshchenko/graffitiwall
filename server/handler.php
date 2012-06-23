<?php
class Handler extends WebSocketUriHandler{
	public function onMessage(IWebSocketConnection $currentUser, IWebSocketMessage $msg){
		$parts = explode("\xff\x00", $msg->getData());
		$messages = array();
		foreach ($parts as $part) {
			$data = json_decode($part, true);
			switch ($data['meta']['type']) {
				case 'd':
					$this->_saveData(json_encode($data['data']));
					$messages[] = $data['data'];
					break;
				case 'c':
					$currentUser->sendString($this->_getData());
					break;
			}
		}
		$packed = json_encode(array(
			'meta' => array('connected' => count($this->users)),
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
			'meta' => array('connected' => count($this->users)),
			'array' => array()
		));
		foreach($this->users as $user){
			if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			}
		}
	}

	private function _getData()
	{
		$data = file_get_contents('backup.log') . file_get_contents('points.log');
		$output = '{"meta":{"connected":"' . count($this->users)
			. '"},"array":[' . str_replace(PHP_EOL, ',', trim($data)) . ']}';

		return $output;
	}

	private function _saveData($data)
	{
		file_put_contents('points.log', $data.PHP_EOL, FILE_APPEND);
	}
}