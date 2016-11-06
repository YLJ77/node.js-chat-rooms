//将消息和昵称/房间变更请求传给服务器

//定义一个javascript"类",在初始化时可用传入一个Socket.IOd的参数socket:
var Chat = function(socket) {
	this.socket = socket;
}

//接着添加这个发送聊天消息的函数：
Chat.prototype.sendMessage = function(room, text) {
	var message = {
		room: room,
		text: text
	}
    this.socket.emit('message', message);
}

//变更房间的函数
Chat.prototype.changeRoom = function(room) {
	this.socket.emit('join', {
		newRoom: room
	});
}

//处理聊天命令
Chat.prototype.processCommand = function(command) {
	var words = command.split(' ');
	//从第一个单词开始解析命令
	var command = words[0]
				  .substring(1, words[0].length)
				  .toLowerCase();
    var message = false;

    switch(command) {
    	case 'join':
    		words.shift();
    		var room = words.join(' ');
    		//处理房间的变换/切换
    		this.changeRoom(room);
    		break;
    	case 'nick':
    		words.shift();
    		var name = words.join(' ');
    		this.socket.emit('nameAttempt', name);
    		break;
    	default:
    		message = 'Unrecongnized command.'
    		break;
    }

    return message;
}