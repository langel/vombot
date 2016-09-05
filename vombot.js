var http_server = require('./source/http_server.js');
var irc_interface = require('./source/irc_interface.js');
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
irc_interface.initialize();
http_server.initialize();
ws_server.initialize();



