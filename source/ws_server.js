var colors = require('colors');
var http = require('http');
var ws = require('websocket');


var conn, ws_http;

module.exports = {

	initialize: function() {
		ws_http = http.createServer(function(request, response) {});
		ws_http.listen(1338, function(){});
		console.log('websockets ready'.magenta);
		ws_server = new ws.server({	
			httpServer: ws_http
		});
		ws_server.on('request', function(request) {
			console.log('http bot window connected'.magenta);
			conn = request.accept(null, request.origin).on('message', function(event) {
				var data = JSON.parse(event.utf8Data);
				var runner_count = Object.keys(data.runners).length;
				//console.log(runner_count);
			});
		});
	},

	send: function(object) {
		if (typeof conn != 'object') {
			console.log('load the browser part n00b!'.green);
		}
		else {
			conn.send(JSON.stringify(object));
		}
	}

};
