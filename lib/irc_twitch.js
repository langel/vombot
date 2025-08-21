var commands = require('./commands.js');
var irc = require('tmi.js');
var markov = require('./markov.js');
var twitch_assets = require('./twitch_assets.js');
var ws_server = require('./ws_server.js');


var creds = require('./../token.json');
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
let markov_freq = 13;
let markov_counter = markov_freq;
let markov_log = [];


var client;

function update_watchers_info(watchers) {
	ws_server.send({
		action: 'watchers_update',
		data: {
			count: watchers.length,
			text: watchers.join(' '),
		}
	});
}

function chat_add(user, message, type) {
	var command = message.substr(1);
	// XXX twitch api suxx0hjrz!!
	//var message_out = twitch_assets.parse_emotes(message);
	var message_out = message;
	/*
	var user_badges = [];
	if (typeof user.badges !== 'null') {
		user_badges = twitch_assets.user_badges_array(user.badges);
	}
	*/
	ws_server.send({
		action: 'chat_add',
		data: {
			//badges: user_badges,
			message: message,
			message_out: message_out,
			user: user,
			type: type,
		},
	});
}

module.exports = {

	initialize: function() {


		// Connect the client to the server..
		client = new irc.client(options);
		client.connect();

		// handle twitch chat events
		client.on('join', function(channel, user) {
			update_watchers_info(twitch_assets.watcher_join(user));
			//client.say(options.channels[0], user + ' has joined');
		});
		client.on('part', function(channel, user) {
			update_watchers_info(twitch_assets.watcher_part(user));
			//client.say(options.channels[0], user + ' has parted');
		});

		client.on('hosted', function(channel, user, viewers) {
			twitch_assets.hosted(user, viewers);
		});

		client.on('action', function(channel, user, message, self) {
			chat_add(user, message, 'action');
		});
		client.on('chat', function(channel, user, message, self) {
			chat_add(user, message, 'text');
			// handle commands
			var words = message.split(' ');
			if (words[0].substring(0, 1) === '!') {
				words[0] = words[0].toLowerCase();
				if (typeof commands[words[0]] === 'function') {
					commands[words[0]](words);
				}
			}
			// log to markov
			console.log('twitch message sent by ' + user['display-name']);
			if (user['display-name'] != 'vomitbot') {
				markov.log_chat(message + '\n');
				if (message.includes('vombot') || message.includes('vomitbot')) {
					client.say(channel, markov.generate_response(message));
				}
				markov_log.push(message);
				if (markov_log.length > 15) {
					markov_log.shift();
				}
				markov_counter--;
				if (markov_counter <= 0) {
					client.say(channel, markov.generate_string(markov_log.join('\n')));
					markov_counter = markov_freq;
				}
			}
		});

		// XXX not followes  :(
		client.on('resub', function(channel, user) {
			client.say(options.channels[0], user + ' has resubbed! deIlluminati deIlluminati deIlluminati');
		});
		client.on('subscription', function(channel, user) {
			client.say(options.channels[0], user + ' has subscribed! KappaRoss KappaRoss KappaRoss');
		});

	}

};
