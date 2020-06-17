var colors = require('colors/safe');
var fs = require('fs');
var http = require('http');
var url = require('url');


module.exports = {

	initialize: function() {
		var http_specs  = {
			ip: "0.0.0.0",
			port: 1337,
		}
		http.createServer(function(req, res) {

			var request = url.parse(req.url, true);
			var action = request.pathname;
			var web_root = 'web';
			console.log(colors.cyan('http access: ' + web_root + action));

			try {
				if (action.substr(-4) == '.gif') {
					var file = fs.readFileSync(web_root + action);
					res.writeHead(200, {'Content-Type': 'image/gif' });
					res.end(file, 'binary');
				}
				else if (action.substr(-3) == '.js') {
					var file = fs.readFileSync(web_root + action);
					res.writeHead(200, {'Content-Type': 'text/javascript' });
					res.end(file, 'binary');
				}
				else if (action.substr(-4) == '.mp3') {
					var file = fs.readFileSync(web_root + action);
					res.writeHead(200, {'Content-Type': 'audio/mpeg' });
					res.end(file, 'binary');
				}
				else if (action.substr(-4) == '.wav') {
					var file = fs.readFileSync(web_root + action);
					res.writeHead(200, {'Content-Type': 'audio/wav' });
					res.end(file, 'binary');
				}
				else {
					if (action == '/') action = '/index.html';
					res.writeHead(200, {'Content-Type': 'text/html'});
					fs.readFile(web_root + action, 'utf8', function(err, data) {
						res.end(data);
					});
				}
			}
			catch(e) {
				console.log(colors.cyan('404/500 http error'));
				//res.writeHEAD(500);
				//res.end();
			}
		}).listen(http_specs.port, http_specs.ip);
		console.log(colors.cyan('http server running at ' + http_specs.ip + ':' + http_specs.port));
	}

};

