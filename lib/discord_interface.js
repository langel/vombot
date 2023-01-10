/*
	discord.io module is currently borked
	use the following to connect properly :
	npm install woor/discord.io#gateway_v6
*/

// XXX they say this is bad so don't do it
// using this to fix TLSSocket error with `pug` trigger
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

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
			//console.log(`discord debug :`);
			//console.log(e);
			let author = (e.d && e.d.author) ? e.d.author.username : ' ';
			console.log(author + ' ' + e.t);
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

			// log incoming
			console.log(message);

			// don't respond to own messages
			if (user_id != bot.id) {

				// PING PONG!!!
				// stay connected! :D/
				if (message === 'ping') {
					bot.sendMessage({
						to: channel_id,
						message: "Pong"
					});
					console.log('discord ping pong');
					return;
				}							

				// relay to irc #botb
				if (channel_id == channel_ids.botb) {
					// handel attachments
					event.d.attachments.forEach((item) => {
						message += "\n" + item.url;
					});
					// relay that shit
					irc_botb.relay('#botb', user, message);
				}
			}
			else message = ' ';

			// what will the bot say?
			let botmess = [];
			let words = message.toLowerCase().split(' ');

			// MARKOV STUFF

			// replace @me's with a string
			let scrubbed_message = message.replace(/<@!?([0-9])+>/g, 'sumnub');
			// respond to name 
			if (message == '!markov' || message.toLowerCase().includes('vombot') || message.includes('tobmov')) {
				m_str = markov.generate_response(message.replace('vombot','').trim());
				botmess.push(m_str);
			}
			/*
			// XXX LOGGING DISABLED FOR NOW
			else {
				// don't markov track in the nsfw channel
				// XXX should read channel name looking for 'nsfw'; requires extra api call
				if (channel_id != channel_ids.nsfw) {
					markov.log_chat(scrubbed_message + '\n');
					console.log('markov logged : ' + message);
				}
			}
			*/
			// count messages in channels
			if (typeof channel_message_counter[channel_id] === "undefined") {
				channel_message_counter[channel_id] = {
					count: 0,
					target: Math.floor(Math.random() * 13 + 12)
				}
			}
			channel_message_counter[channel_id].count++;
			// interject responses randomly
			// XXX should log conversation for the last x messages
			// how many 5 - 25?
			if (channel_message_counter[channel_id].count >= channel_message_counter[channel_id].target) {
				m_str = markov.generate_string(message);
				if (m_str !== false) {
					botmess.push(m_str);
					delete channel_message_counter[channel_id];
				}
			}

			// 56 
			if (words.indexOf('56') !== -1) {
				console.log('discord 56');
				botmess.push('56 :D');
			}
			// case in point 
			if (message.toLowerCase().indexOf('case in point') != -1) {
				console.log('discord case in point');
				botmess.push("👉 in 💼");
			}
			// cum 
			if (words.indexOf('cum') != -1) {
				console.log('discord cum');
				botmess.push("oi mate watch your fuckin' language");
			}
			// paradigm
			if (words.indexOf('paradigm') != -1) {
				console.log('paradigm pair of dimes');
				bot.sendMessage({
					to: channel_id,
					message: 'https://pantheistic.files.wordpress.com/2012/06/pair-of-dimes1.jpg'
				});
			}
			// pugs
			if (message.toLowerCase().indexOf('pug') != -1) {
				console.log('discord pug');
				request('https://dog.ceo/api/breed/pug/images', (error, response, body) => {
					if (error) {
						return console.error('pug request failed:', error);
					}
					body = JSON.parse(body);
					if (Array.isArray(body.message)) {
						let pug_url = body.message[Math.floor(Math.random() * body.message.length)];
						console.log(pug_url);
						bot.sendMessage({
							to: channel_id,
							message: pug_url
						});
					}
				});
			}
			// TACOS & PIZZAS
			let tacopizza = 0;
			if (message.toLowerCase().indexOf('taco') != -1) tacopizza += 1;
			if (message.toLowerCase().indexOf('pizza') != -1) tacopizza += 2;

			// taco
			if (tacopizza == 1) {
				console.log('discord taco');
				botmess.push(':taco: TAC0 TIME!! :taco:');
			}
			// pizza 
			if (tacopizza == 2) {
				console.log('discord pizza');
				botmess.push(':pizza: PRAISE ZA! :pizza:');
			}
			// taco pizza
			if (tacopizza == 3) {
				console.log('discord tacopizza');
				botmess.push(':taco::pizza: `OLY FUCK GIMME TACOPIZZA N0mn0MN0M!!! :pizza::taco:');
			}

			// debug (show map)
			if (channel_id == channel_ids.dm) {
				if (message == '!map') {
					console.log(markov.map_get());
				}
			};

			// SEND OUT SOME NOISE!
			if (botmess.length > 0) {
				botmess = botmess.join("\n");
				bot.sendMessage({
					to: channel_id,
					message: botmess,
				});
				if (channel_id == channel_ids.botb) irc_botb.relay('#botb', '', botmess);
			}

		});

		console.log(bot);
	},


	channel_id: function(channel_name) {
		return channel_ids[channel_name];
	},

	relay: function(channel_id, user, message, type) {
		console.log('sending message to discord ' + channel_id);
		console.log(message);
		if (user == 'BotB') {
			message = '**BotB :: ' + message + '**';
		}
		else if (user.length > 0) {
			if (type == 'action') {
				message = '\* **' + user + '** ' + message;
			}
			else message = '[**' + user + '**] ' + message;
		}
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
