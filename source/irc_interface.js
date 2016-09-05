var irc = require('tmi.js');
var twitch_assets = require('./twitch_assets.js');
var ws_server = require('./ws_server.js');


var creds = require('./../token.js');
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

module.exports = {

	initialize: function() {

		// Connect the client to the server..
		client = new irc.client(options);
		client.connect();

		// handle twitch chat events
		client.on('join', function(channel, user) {
			update_watchers_info(twitch_assets.watcher_join(user));
		});
		client.on('part', function(channel, user) {
			update_watchers_info(twitch_assets.watcher_part(user));
		});

		client.on('hosted', function(channel, user, viewers) {
			twitch_assets.hosted(user, viewers);
		});

		// CHAT RESPONSE
		client.on('chat', function(channel, user, message, self) {
			var command = message.substr(1);
			var message_words = message.split(' ');
			var message_out = twitch_assets.parse_emotes(message);
			var user_badges = [];
			if (typeof user.badges !== 'null') {
				user_badges = twitch_assets.user_badges_array(user.badges);
			}
			if (user['message-type'] == 'chat') {
				ws_server.send({
					action: 'chat_add',
					data: {
						badges: user_badges,
						message: message,
						message_out: message_out,
						user : user,
					},
				});
			}
			if (message_words[0] == '!runner') {
				spawn_random_runner();
			}
			if (message_words[0] == '!this') {
				dick_marquee(message_words[1]);
				client.say(options.channels[0], '!runner');
			}
		});


	}

};
