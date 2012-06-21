#!/php -q
<?php
date_default_timezone_set('Europe/London');
require_once("phpws/websocket.server.php");
require('handler.php');
/**
 * Basic websocket server
 */
class SocketServer implements IWebSocketServerObserver{
	protected $debug = false;
	protected $server;

	public function __construct(){
		$this->server = new WebSocketServer("tcp://0.0.0.0:12345", 'superdupersecretkey');
		$this->server->addObserver($this);

		$this->server->addUriHandler("wall", new Handler());
	}

	public function onConnect(IWebSocketConnection $user){
		$this->say("{$user->getId()} connected");
	}

	public function onMessage(IWebSocketConnection $user, IWebSocketMessage $msg){
		//$this->say("[DEMO] {$user->getId()} says '{$msg->getData()}'");
	}

	public function onDisconnect(IWebSocketConnection $user){
		$this->say("{$user->getId()} disconnected");
	}

	public function onAdminMessage(IWebSocketConnection $user, IWebSocketMessage $msg){
		$this->say("Admin Message received!");

		$frame = WebSocketFrame::create(WebSocketOpcode::PongFrame);
		$user->sendFrame($frame);
	}

	public function say($msg){
		echo "$msg \r\n";
	}

	public function run(){
		$this->server->run();
	}
}

// Start server
$server = new SocketServer();
$server->run();