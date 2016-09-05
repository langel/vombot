var colors = require('colors');
var fs = require('fs');
var ws_server = require('./ws_server.js');



//  RUNNER HANDLER HERE
var available_runners = [];

(function init_runner_data() {
	available_runners = fs.readdirSync('source/html/sprites/').filter(function(val) {
		return (val.indexOf('-running.gif') != -1);
	});
	console.log(available_runners);
})();


module.exports = {

	'!runner': function(words) {
		var runner_name = available_runners[Math.floor(Math.random() * available_runners.length)];
		runner_name = runner_name.substr(0, runner_name.indexOf('-'));
		log = 'runner ' + runner_name + ' added';
		console.log(log.red);
		ws_server.send({
			action: 'spawn_runner',
			data: runner_name,
		});
	},

	'!this': function(words) {
		dick_size = parseInt(words[1]);
		if (!Number.isInteger(dick_size)) dick_size = 6;
		if (dick_size < 2) dick_size = 2;
		if (dick_size > 253) dick_size = 253;
		var dick_out = '8' + Array(dick_size).join('=') + 'D';
		console.log(dick_out.rainbow);
		ws_server.send({
			action: 'dick_this',
			data: dick_out,
		});
	},

};
