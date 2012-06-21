<?php
class Handler extends WebSocketUriHandler{
	public function onMessage(IWebSocketConnection $currentUser, IWebSocketMessage $msg){
		$parts = explode("\xff\x00", $msg->getData());
		$messages = array();
		foreach ($parts as $part) {
			file_put_contents('points.log', $part.PHP_EOL, FILE_APPEND);
			$data = json_decode($part, true);
			$data['connected'] = count($this->users);
			$messages[] = $data; 
		}
		$packed = json_encode($messages);
		
		foreach($this->users as $user){
			if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			}
		}

		// Draw on image
		// Save image
	}

	public function addConnection(IWebSocketConnection $user){
		$data = file_get_contents('points.log');
		$output = array();
		foreach (explode(PHP_EOL, $data) as $line) {
			$output[] = json_decode($line, true);
		}
		$user->sendString(json_encode($output));
		$this->users->attach($user);
	}

	public function onAdminMessage(IWebSocketConnection $user, IWebSocketMessage $obj){
		$this->say("Admin TEST received!");

		$frame = WebSocketFrame::create(WebSocketOpcode::PongFrame);
		$user->sendFrame($frame);
	}
}