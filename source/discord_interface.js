var creds = require('./../token.json');
var discord = require('discord.io');
var markov = require('./markov.js');

var bot;

var noise_queue = {};

setInterval(function() {
/*

WHAT THE FUCK IT THIS FOR?

	if (noise_queue.length != 0) {
		bot.sendMessage(noise_queue);
		noise_queue = {};
	}
*/
}, 25000);
	

module.exports = {

	initialize: function() {
		var discord_creds = {
			token: creds.discord.token,
			autorun: true
		};

		markov.init();
		bot = new discord.Client(discord_creds);

		bot.on('ready', function() {
			console.log(bot.username + ' has joined discord');
			//console.log(bot);
		});

		bot.on('message', function(user, user_id, channel_id, message, event) {
			if (user_id != bot.id) {
				// stay connected! :D/
				if (message === 'ping') {
					bot.sendMessage({
						to: channel_id,
						message: "pong!"
					});
					console.log('discord ping pong');
				}							
				markov.log_chat(message + '\n');
				if (message == '!markov') {
					bot.sendMessage({
						to: channel_id,
						message: markov.generate_string(33),
					});
				}
				// pizza 
				if (message.toLowerCase().indexOf('pizza') != -1) {
					console.log('discord pizza');
					bot.sendMessage({
						to: channel_id,
						message: ':pizza: PRAISE ZA! :pizza:'
					});
				}
				if (channel_id == '239197333424832522') {
					noise_queue = {
						to: channel_id,
						message: 'what you say!'
					};
				};
				if (channel_id == '346192728499027978') {
				/*
					bot.sendMessage({
						to: channel_id,
						message: 'you dong'
					});
				*/
					if (message == '!map') {
						console.log(markov.map_get());
					}
				};
			};
		});
	}

};
