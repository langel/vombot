var discord_interface = require('./lib/discord_interface2.js');
var http_server = require('./lib/http_server.js');
var irc_twitch = require('./lib/irc_twitch.js');
var irc_botb = require('./lib/irc_botb.js');
var markov = require('./lib/markov.js');
var twitch_assets = require('./lib/twitch_assets.js');
var twitch_ws = require('./lib/twitch_ws.js');
var ws_server = require('./lib/ws_server.js');



process.on('unhandledRejection', (e) => {
	console.log(e);
});


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
ws_server.initialize();
//twitch_ws.initialize();


