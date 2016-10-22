var creds = require('./../token.json');
var discord = require('discord.io');

var bot;

var noise_queue = {};

setInterval(function() {
	if (noise_queue.length != 0) {
		bot.sendMessage(noise_queue);
		noise_queue = {};
	}
}, 5000);
	

module.exports = {

	initialize: function() {
		var discord_creds = {
			token: creds.discord.token,
			autorun: true
		};

		bot = new discord.Client(discord_creds);

		bot.on('ready', function() {
			console.log(bot.username + ' has joined discord');
			//console.log(bot);
		});

		bot.on('message', function(user, user_id, channel_id, message, event) {
			if (user_id != bot.id) {
				if (channel_id == '239197333424832522') {
					noise_queue = {
						to: channel_id,
						message: ':derp: :pizza: :illuminati: :pepe:'
					};
				};
			};
		});
	}

};
