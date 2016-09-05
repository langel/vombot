var colors = require('colors');
var http_server = require('./source/http_server.js');
var irc_interface = require('./source/irc_interface.js');
var twitch_assets = require('./source/twitch_assets.js');
var ws_server = require('./source/ws_server.js');
var fs = require('fs');




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



//  RUNNER HANDLER HERE
var available_runners = [];

function spawn_random_runner() {
	var runner_name = available_runners[Math.floor(Math.random() * available_runners.length)];
	runner_name = runner_name.substr(0, runner_name.indexOf('-'));
	log = 'runner ' + runner_name + ' added';
	console.log(log.red);
	sock_send(JSON.stringify({
		action: 'spawn_runner',
		data: runner_name,
	}));
}

(function init_runner_data() {
	available_runners = fs.readdirSync('source/html/sprites/').filter(function(val) {
		return (val.indexOf('-running.gif') != -1);
	});
	console.log(available_runners);
})();


//  DICK MARQUEE
function dick_marquee(dick_size) {
	dick_size = parseInt(dick_size);
	if (!Number.isInteger(dick_size)) dick_size = 6;
	if (dick_size < 2) dick_size = 2;
	if (dick_size > 253) dick_size = 253;
	var dick_out = '8' + Array(dick_size).join('=') + 'D';
	console.log(dick_out.rainbow);
	sock_send(JSON.stringify({
		action: 'dick_this',
		data: dick_out,
	}));
}
