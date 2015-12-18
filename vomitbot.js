// Do NOT include this line if you are using the built js version!

var http = require('http');
var ws = require('websocket');
var irc = require('tmi.js');
var fs = require('fs');
var url = require('url');

var cr = "\r\n";

// BOT CODE HERE
var creds = require('./token.js');
var options = {
	options: {
		debug: true
	},
	connection: {
		random: "chat",
		reconnect: true
	},
	identity: {
		username: 'vomitbot',
		password: creds.twitch.oauth
	},
	channels: ["#puke7"]
};


// Connect the client to the server..
var client = new irc.client(options);
client.connect();

// handle twitch chat events
client.on('join', function(channel, user) {
	console.log(user + ' has joined' + cr);
});
client.on('part', function(channel, user) {
	console.log(user + ' has parted' + cr);
});
client.on('hosted', function(channel, user, viewers) {
	console.log(user + ' now hosting with ' + viewer_count + ' viewers'+ cr);
});
var runners_list = [
	'contraman',
	'megaman',
];
client.on('chat', function(channel, user, message, self) {
	var command = message.substr(1);
	if (runners_list.indexOf(command) > -1) {
		spawn_runner(command);
	}
});




// SERVER CODE HERE 
var http_specs  = {
	ip: "192.168.1.125",
	port: 3000,
}
http.createServer(function (req, res) {

	var request = url.parse(req.url, true);
	var action = request.pathname;
	//console.log(action);

	if (action.substr(-4) == '.gif') {
		try {	
			var img = fs.readFileSync('html/' + action);
			res.writeHead(200, {'Content-Type': 'image/gif' });
			res.end(img, 'binary');
		}
		catch(e) {
			res.writeHead(500);
			res.end();
		}
	}
	else if (action.substr(-3) == '.js') {
		var img = fs.readFileSync('html/' + action);
		res.writeHead(200, {'Content-Type': 'text/javascript' });
		res.end(img, 'binary');
	}
	else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		fs.readFile('html/running.html', 'utf8', function(err, data) {
			res.end(data);
		});
	}
}).listen(http_specs.port, http_specs.ip);
console.log('Server running at ' + http_specs.ip + ':' + http_specs.port);



// WEBSOCKETS HERE
var conn;
var ws_http = http.createServer(function(request, response) {});
ws_http.listen(1337, function(){});
console.log('websockets ready');
ws_server = new ws.server({	
	httpServer: ws_http
});
ws_server.on('request', function(request) {
	console.log('somone reqeusted');
	conn = request.accept(null, request.origin).on('message', function(event) {
//		console.log(event);
		var data = JSON.parse(event.utf8Data);
		var runner_count = Object.keys(data.runners).length;
		console.log(runner_count);
		if (runner_count < 3) {
			console.log('adding duder');
			client.say('#puke7', '!' + runners_list[Math.floor(Math.random() * runners_list.length)]);
		}
	});
});


function spawn_runner(name) {
	conn.send(JSON.stringify({
		action: 'spawn_runner',
		data: name,
	}));
}


