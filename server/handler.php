<?php
class Handler extends WebSocketUriHandler{
	protected $debug = false;
	public function onMessage(IWebSocketConnection $currentUser, IWebSocketMessage $msg){
		$parts = explode('?', $msg->getData());
		$this->say("Message came in ".count($parts).' parts');
		$messages = array();
		foreach ($parts as $part) {
			$data = json_decode($part, true);
			$data['connected'] = count($this->users);
			$messages[] = $data; 
		}
		$packed = json_encode($messages);
		
		foreach($this->users as $user){
			//if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			//}
		}

		// Draw on image
		// Save image
	}

	public function onAdminMessage(IWebSocketConnection $user, IWebSocketMessage $obj){
		$this->say("Admin TEST received!");

		$frame = WebSocketFrame::create(WebSocketOpcode::PongFrame);
		$user->sendFrame($frame);
	}
}