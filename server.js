//内置的http模块提供了HTTP服务器和客户端功能
var http =  require('http');
var fs = require('fs');
//内置的path模块提供了与文件系统路径相关功能
var path = require('path');
//附加的mime模块有根据文件扩展名MIME类型的能力
var mime = require('mime');
//cache是用来缓存文件内容的对象
var cache = {};
var chatServer = require('./lib/chat_server');

//发送文件数据及错误响应，三个辅助函数以提供静态HTTP文件服务

//在所请求的文件不存在时发送404错误
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

//提供文件数据服务，这个函数先写出正确的HTTP头，然后发送文件的内容
function sendFile(response, filePath, fileContents) {
	response.writeHead(
			200,
			{"content-type": mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

//会确定文件是否缓存了，如果是，就返回它。如果文件还没被缓存，它会从硬盘中读取并返回它。如果文件不存在，则返回一个HTTP 404错误作为响应
function serverStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				})
			} else {
				send404(response);
			}
		})
	}
}

//创建HTTP服务器的逻辑
var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serverStatic(response, cache, absPath);
})

//启动HTTP服务器
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
})

chatServer.listen(server);