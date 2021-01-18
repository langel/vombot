var irc = require('irc');
var markov = require('./markov.js');
var discord_interface;

var bot;
var client;
var options = {
	server: 'irc.esper.net',
	username: 'vombot',
	channel: '#botb',
};
//var nick_color = '\x02\x0302,01';
var nick_color = '\x02';
var reset_color = '\x0f';

var message_handle = (from, to, text, info, type) => {
	var channel_id = discord_interface.channel_id('botb');
	// block highlighting dickswordians
	let scrubbed_text = text.replace(/<@!?([0-9])+>/g, 'sumnub');
	// scrub out ansi/irc command/color codes
	scrubbed_text = scrubbed_text.replace(/\u0003(?:[0-9]{1,2})?(?:,[0-9]{1,2})?|\u0002|\u001d|\u001f|\u001e|\u0011/g, '');
	// XXX there's a new bridge in town
	/*
	discord_interface.relay(channel_id, from, scrubbed_text, type);
	if (text.includes('vombot'.toLowerCase())) {
		let m_str = markov.generate_string();
		bot.say(to, m_str);
		discord_interface.relay(channel_id, '', m_str);
	}
	else {
		markov.log_chat(scrubbed_text + '\n');
	}
	*/
};

module.exports = {

	initialize: function() {
		
		discord_interface = require('./discord_interface.js');

		bot = new irc.Client('irc.esper.net', 'vombot', {
			userName: 'vombot',
			realName: 'puke7\'s_vombot',
			debug: true,
			autoRejoin: true,
			channels: ['#botb','#botb_bot_test'],
		});

		bot.addListener('action', (from, to, text, info) => {
			message_handle(from, to, text, info, 'action');
			console.log('CALL TO ACITON!!!');
		});

		bot.addListener('message', (from, to, text, info) => {
			message_handle(from, to, text, info, 'message');
		});
	},
	
	relay: function(to, user, text) {
	// XXX there's a new bridge in town
	/*
		console.log('sending to irc ' + to + ' : ' + text);
		let nick = '';
		if (user.length > 0) nick = '[' + nick_color + user + reset_color + ']';
		// check for bot commands
		if (text.substr(0,1) == '!' || text.slice(-2) == '++' || text.slice(-2) == '--') {
			bot.say(to, nick);
			bot.say(to, text);
		}
		else bot.say(to, nick + ' ' + text);
	*/
	},

	say: function(to, text) {
		console.log('sending to irc ' + to + ' : ' + text);
		bot.say(to, text);
	},
	
};
