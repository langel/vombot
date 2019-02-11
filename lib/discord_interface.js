/*
	discord.io module is currently borked
	use the following to connect properly :
	npm install woor/discord.io#gateway_v6
*/

var creds = require('./../token.json');
var discord = require('discord.io');
var markov = require('./markov.js');
var irc_botb = require('./irc_botb.js');
var urlencode = require('urlencode');
var request = require('request');

var bot;
var channel_ids = {
	botb: '239107754575265803',
	nsfw: '460936042522869770',
	dm: '346236161922039818',
};

var noise_queue = {};
var channel_message_counter = {};
var channel_data = {};
var api = `https:\/\/canary.discordapp.com/api/v6`;


var get_channel_status = function(channel_id) {
	if (typeof channel_data[channel_id] !== 'object') {
		bot._req('get', `${api}/channels/${channel_id}`, function(err, res) {
			console.log(res.body);	
			return channel_data[channel_id] = res.body;
		});
	}
	else return channel_data[channel_id];
}


module.exports = {

	initialize: function() {
		var discord_creds = {
			token: creds.discord.token,
			autorun: true
		};

		bot = new discord.Client(discord_creds);

		bot.on('debug', (e) => {
			console.log(`discord debug :`);
			console.log(e);
			// XXX make this a function?
			if (e.t === 'MESSAGE_REACTION_ADD') {
				var emoji = (e.d.emoji.id === null) ? urlencode(e.d.emoji.name) : e.d.emoji.name + ':' + e.d.emoji.id;
				bot._req(
					'put', 
					`${api}/channels/${e.d.channel_id}/messages/${e.d.message_id}/reactions/${emoji}/@me`, 
					(err, res)=>{
						console.log(err);
						//console.log(res);
					}
				);  
			}
		});

		bot.on('error', (e) => {
			console.log(`discord error :`);
			console.log(e);
		});

		bot.on('disconnect', (errMsg, code) => {
			console.log('discord disconnect');
			console.log(code + ' :: ' + errMsg);
			setTimeout(() => {
				console.log('reconnecting...');
				bot.connect();
			}, 250);
		});

		bot.on('ready', function() {
			console.log(bot.username + ' has joined discord');
			//console.log(bot);
		});

		bot.on('message', function(user, user_id, channel_id, message, event) {
			console.log(message);
			if (user_id != bot.id) {
				// stay connected! :D/
				if (message === 'ping') {
					bot.sendMessage({
						to: channel_id,
						message: "Pong"
					});
					console.log('discord ping pong');
				}							
				else {
					// post to irc #botb
					if (channel_id == channel_ids.botb) {
						irc_botb.relay('#botb', user, message);
					}
					// replace @me's with a string
					let scrubbed_message = message.replace(/<@!?([0-9])+>/g, 'sumnub');
					// respond to name 
					if (message == '!markov' || message.toLowerCase().includes('vombot') || message.includes('tobmov')) {
						m_str = markov.generate_string(message.replace('vombot',''));
						bot.sendMessage({
							to: channel_id,
							message: m_str,
						});
						if (channel_id == channel_ids.botb) irc_botb.relay('#botb', '', m_str);
					}
					else {
						// don't markov track in the nsfw channel
						// XXX should read channel name looking for 'nsfw'; requires extra api call
						if (channel_id != channel_ids.nsfw) {
							markov.log_chat(scrubbed_message + '\n');
							console.log('markov logged : ' + message);
						}
					}
					// count messages in channels
					if (typeof channel_message_counter[channel_id] === "undefined") {
						channel_message_counter[channel_id] = {
							count: 0,
							target: Math.floor(Math.random() * 13 + 12)
						}
					}
					channel_message_counter[channel_id].count++;
					// interject responses randomly
					if (channel_message_counter[channel_id].count >= channel_message_counter[channel_id].target) {
						m_str = markov.generate_string(message);
						bot.sendMessage({
							to: channel_id,
							message: m_str,
						});
						if (channel_id == channel_ids.botb) irc_botb.relay('#botb', '', m_str);
						// if its time post message and reset counter
						delete channel_message_counter[channel_id];
					}
				}
				// pizza 
				if (message.toLowerCase().indexOf('pizza') != -1) {
					console.log('discord pizza');
					bot.sendMessage({
						to: channel_id,
						message: ':pizza: PRAISE ZA! :pizza:'
					});
				}
				// pugs
				if (message.toLowerCase().indexOf('pug') == 0) {
					console.log('discord pug');
					request('http://pugme.herokuapp.com/random', function(error, response, body) {
						if (!error && response.statusCode == 200) {
							var pug_json = JSON.parse(body);
							bot.sendMessage({
								to: channel_id,
								message: pug_json.pug
							});
						}
					});
				}
				// show map
				if (channel_id == channel_ids.dm) {
					if (message == '!map') {
						console.log(markov.map_get());
					}
				};
			};
		});

		console.log(bot);
	},


	channel_id: function(channel_name) {
		return channel_ids[channel_name];
	},

	relay: function(channel_id, user, message) {
		console.log('sending message to discord ' + channel_id);
		console.log(message);
		if (user == 'BotB') {
			message = '**BotB :: ' + message + '**';
		}
		else if (user.length > 0) message = '[**' + user + '**] ' + message;
		console.log(bot.sendMessage({
			to: channel_id,
			message: message,
		}));
	},

	say: function(channel_id, message) {
		console.log('sending message to discord ' + channel_id);
		console.log(message);
		console.log(bot.sendMessage({
			to: channel_id,
			message: message,
		}));
	},

};
