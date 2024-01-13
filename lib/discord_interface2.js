
const { Client, Events, GatewayIntentBits } = require('discord.js');
var creds = require('./../token.json');
var markov = require('./markov.js');
var irc_botb = require('./irc_botb.js');
var urlencode = require('urlencode');
var request = require('request');

const bot = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.MessageContent
]});

var channel_ids = {
	botb: '239107754575265803',
	nsfw: '460936042522869770',
	dm: '346236161922039818',
};

var channel_counter = {};


module.exports = {

	initialize: function() {
		
		bot.once(Events.ClientReady, readyClient => {
			console.log(`DISCORD PIPE! Logged in as ${readyClient.user.tag}`);
		});

		bot.login(creds.discord.token);

		bot.on('messageReactionAdd', reaction => {
			try {
				reaction.message.react(reaction._emoji);
			} catch (error) {
				console.log('DISCORD REACTION ADD FAILURE');
				console.log(error);
			}
		});

		bot.on('messageCreate', message => {
			let bot_id = bot.user.id;
			let author = message.author.username;
			let user_id = message.author.id;
			let channel_id = message.channelId;
			let channel = bot.channels.cache.get(channel_id);
			let content = message.content;
			console.log('DISCORD :: ' + channel_id + ' ' + author + ' : ' + content);

			if (bot_id == user_id) return;

			let botmess = [];
			let words = content.toLowerCase().split(' ');

			// MARKOV
			// replace @me's with a string
			let scrubbed_content = content.replace(/<@!?([0-9])+>/g, 'sumnub');
			// respond to name 
			if (content == '!markov' || content.toLowerCase().includes('vombot') || content.includes('tobmov')) {
				botmess.push(markov.generate_response(content.replace('vombot','').trim()));
			}
			// if markov not directly triggered do this stuff
			else {
				// count channel messages since last interjection
				if (typeof channel_counter[channel_id] === 'undefined') {
					channel_counter[channel_id] = {
						count: 0,
						target: Math.floor(Math.random() * 13 + 13)
					};
				}
				channel_counter[channel_id].count++;
				if (channel_counter[channel_id].count >= channel_counter[channel_id].target) {
					let interjection = markov.generate_string(content);
					if (interjection != false) {
						botmess.push(interjection);
						delete channel_counter[channel_id];
					}
				}
			}

			// 56 
			if (words.indexOf('56') !== -1) {
				console.log('discord 56');
				botmess.push('56 :D');
			}
			// case in point 
			if (content.toLowerCase().indexOf('case in point') != -1) {
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
				channel.send('https://pantheistic.files.wordpress.com/2012/06/pair-of-dimes1.jpg');
			}
			// pugs
			if (content.toLowerCase().indexOf('pug') != -1) {
				console.log('discord pug');
				request('https://dog.ceo/api/breed/pug/images', (error, response, body) => {
					if (error) {
						return console.error('pug request failed:', error);
					}
					body = JSON.parse(body);
					console.log(body.message);
					if (Array.isArray(body.message)) {
						let pug_url = body.message[Math.floor(Math.random() * body.message.length)];
						console.log(pug_url);
						channel.send(pug_url);
					}
				});
			}
			// TACOS & PIZZAS
			let tacopizza = 0;
			if (content.toLowerCase().indexOf('taco') != -1) tacopizza += 1;
			if (content.toLowerCase().indexOf('pizza') != -1) tacopizza += 2;

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

			// SPILL THE NOISE
			if (botmess.length > 0) {
				let output = botmess.join('/n');
				bot.channels.cache.get(channel_id).send(output);
			}
		});
	}
}
