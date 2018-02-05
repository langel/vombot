var discord_interface = require('./source/discord_interface.js');
var http_server = require('./source/http_server.js');
var irc_twitch = require('./source/irc_twitch.js');
var irc_botb = require('./source/irc_botb.js');
var markov = require('./source/markov.js');
var twitch_assets = require('./source/twitch_assets.js');
var ws_server = require('./source/ws_server.js');




/*
	trying to replace twitch alerts with new follower alerts
curl.get('https://api.twitch.tv/kraken/channels/puke7/follows', {
	HTTPHEADER: 'Accept: application/vnd.twitchtv.v3+json'
}, function(err) {
	//console.info(this);
});
*/


/*
 * initialize services
 */
twitch_assets.initialize();
discord_interface.initialize();
irc_twitch.initialize();
irc_botb.initialize();
http_server.initialize();
markov.initialize('markov_log.txt');
ws_server.initialize();



