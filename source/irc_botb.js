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
				discord_interface.say(channel_id, '<' + from + '> ' + text);
				let scrubbed_text = text.replace(/<@!?([0-9])+>/g, 'sumnub');
				markov.log_chat(scrubbed_text + '\n');
			}
		});
	},

	say: function(to, text) {
		console.log('sending to irc ' + to + ' : ' + text);
		bot.say(to, text);
	},
	
};
