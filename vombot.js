var curl = require('curl');
var http = require('http');
var http_server = require('./source/http_server.js');
var ws = require('websocket');
var irc = require('tmi.js');
var fs = require('fs');

var cr = "\r\n";

// BOT CODE HERE
var creds = require('./token.js');
var options = {
	options: {
		debug: true
	},
	connection: {
		reconnect: true,
		cluster: "aws",
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
	user_join(user);
});
client.on('part', function(channel, user) {
	console.log(user + ' has parted' + cr);
	user_part(user);
});
client.on('hosted', function(channel, user, viewers) {
	console.log(user + ' now hosting with ' + viewer_count + ' viewers'+ cr);
});


curl.get('https://api.twitch.tv/kraken/channels/puke7/follows', {
	HTTPHEADER: 'Accept: application/vnd.twitchtv.v3+json'
}, function(err) {
	//console.info(this);
});

/*
 * load badge and emote info from twitch api
 */
var badges, emotes;
curl.get('https://api.twitch.tv/kraken/chat/emotes/emoticons', {}, function(err, response, body) {
	// interpret response
	response = JSON.parse(body);
	var data = response.emoticons;
	// create the map
	emotes = new Map();
	data.forEach(function(emote) {
		emotes.set(emote.regex, emote.url);
	});
	console.log('emotes loaded');
});
curl.get('https://api.twitch.tv/kraken/chat/emotes/badges', {}, function(err, response, body) {
	// interpret response
	var data = JSON.parse(body);
	badges = new Map();
	for (key in data) {
		if ((typeof data[key] === 'object') && (data[key] !== null)) {
			if (data[key].hasOwnProperty('image')) {
				badges.set(key, data[key].image);
			}
		}
	}
	console.log('badges loaded');
});

function parse_emotes(string) {
	var words = string.split(' ');
	for (i in words) {
		if (emotes.has(words[i])) {
			words[i] = '<img src="' + emotes.get(words[i]) + '">';
		}
	}
	return words.join(' ');
}

// CHAT RESPONSE
client.on('chat', function(channel, user, message, self) {
	var command = message.substr(1);
	var message_words = message.split(' ');
	var message_out = parse_emotes(message);
	var user_badges = [];
	if (typeof user.badges !== 'null') {
		for (badge_type in user.badges) {
			user_badges.push(badges.get(badge_type));
		}
	}
	if (message_words[0] == '!runner') {
		spawn_random_runner();
	}
	if (message_words[0] == '!this') {
		dick_marquee(message_words[1]);
	}
	if (user['message-type'] == 'chat') {
		sock_send(JSON.stringify({
			action: 'chat_add',
			data: {
				badges: user_badges,
				message: message,
				message_out: message_out,
				user : user,
			},
		}));
	}
});


http_server.initialize();



// WEBSOCKETS HERE
var conn;
var ws_http = http.createServer(function(request, response) {});
ws_http.listen(1338, function(){});
console.log('websockets ready');
ws_server = new ws.server({	
	httpServer: ws_http
});
ws_server.on('request', function(request) {
	console.log('http bot window reloaded');
	conn = request.accept(null, request.origin).on('message', function(event) {
//		console.log(event);
		var data = JSON.parse(event.utf8Data);
		var runner_count = Object.keys(data.runners).length;
		//console.log(runner_count);
	});
	conn.on('connect', function() {
	});
});

function client_send_init() {
	console.log('client init');
	update_watchers_info();
	spawn_random_runner();
}

function sock_send(data) {
	if (typeof conn != 'object') {
		console.log('load the browser part n00b!');
	}
	else {
		conn.send(data);
	}
}


//  RUNNER HANDLER HERE
var available_runners = [];
function init_runner_data() {
	available_runners = fs.readdirSync('source/html/sprites/').filter(function(val) {
		return (val.indexOf('-running.gif') != -1);
	});
	console.log(available_runners);
};
init_runner_data();
function spawn_random_runner() {
	var runner_name = available_runners[Math.floor(Math.random() * available_runners.length)];
	runner_name = runner_name.substr(0, runner_name.indexOf('-'));
	console.log(runner_name);
	sock_send(JSON.stringify({
		action: 'spawn_runner',
		data: runner_name,
	}));
}


// WATCHERS HANDLER HERE
var watchers = [];
function user_join(user) {
	watchers.unshift(user);
	update_watchers_info();
}
function user_part(user) {
	watchers.splice(watchers.indexOf(user), 1);
	update_watchers_info();
}
function update_watchers_info() {
	sock_send(JSON.stringify({
		action: 'watchers_update',
		data: {
			count: watchers.length,
			text: watchers.join(' '),
		}
	}));
}


//  DICK MARQUEE
function dick_marquee(dick_size) {
	dick_size = parseInt(dick_size);
	if (!Number.isInteger(dick_size)) dick_size = 6;
	if (dick_size < 2) dick_size = 2;
	if (dick_size > 253) dick_size = 253;
	var dick_out = '8' + Array(dick_size).join('=') + 'D';
	console.log(dick_out);
	sock_send(JSON.stringify({
		action: 'dick_this',
		data: dick_out,
	}));
}
