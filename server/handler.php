<?php
class Handler extends WebSocketUriHandler{
	public function onMessage(IWebSocketConnection $currentUser, IWebSocketMessage $msg){
		$message = json_decode($msg->getData(), true);
		$message['connected'] = count($this->users);
		$packed = json_encode($message);
		foreach($this->users as $user){
			if ($user->getId() !== $currentUser->getId()){
				$user->sendString($packed);
			}
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