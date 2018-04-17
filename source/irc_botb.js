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

		bot.addListener('message', (from, to, text, info) => {
			if (text.includes('vombot'.toLowerCase())) {
				bot.say(to, markov.generate_string());
			}
			else {
				var channel_id = discord_interface.channel_id('botb');
				// block highlighting dickswordians
				let scrubbed_text = text.replace(/<@!?([0-9])+>/g, 'sumnub');
				// scrub out ansi/irc command/color codes
				scrubbed_text = scrubbed_text.replace(/\u0003(?:[0-9]{1,2})?(?:,[0-9]{1,2})?|\u0002|\u001d|\u001f|\u001e|\u0011/g, '');
				discord_interface.relay(channel_id, from, scrubbed_text);
				markov.log_chat(scrubbed_text + '\n');
			}
		});
	},
	
	relay: function(to, user, text) {
		console.log('sending to irc ' + to + ' : ' + text);
		let nick = '[' + nick_color + user + reset_color + ']';
		// check for bot commands
		if (text.substr(0,1) == '!') {
			bot.say(to, nick);
			bot.say(to, text);
		}
		else bot.say(to, nick + ' ' + text);
	},

	say: function(to, text) {
		console.log('sending to irc ' + to + ' : ' + text);
		bot.say(to, text);
	},
	
};