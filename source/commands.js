var colors = require('colors');
var fs = require('fs');
var ws_server = require('./ws_server.js');



//  ASSET MEDIA HANDLER HERE
var available_runners = [];
var princess_sounds = [];

(function init_runner_data() {
	available_runners = fs.readdirSync('source/html/sprites/').filter(function(val) {
		return (val.indexOf('-running.gif') != -1);
	});
	console.log(available_runners);
})();

(function init_princess_audio() {
	princess_sounds = fs.readdirSync('source/html/audio/peach/').filter(function(val) {
		return (val.indexOf('.wav') != -1);
	});
	console.log(princess_sounds);
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

	'!pace': function() {
		ws_server.send({
			action: 'play_audio',
			data: 'wrp.mp3',
		});
	},

	'!princess': function(words) {
		var audio_file = princess_sounds[Math.floor(Math.random() * princess_sounds.length)];
		//audio_file = audio_file.substr(0, audio_file.indexOf('-'));
		log = 'princess audio ' + audio_file + ' played';
		console.log(log.red);
		ws_server.send({
			action: 'play_audio',
			data: 'peach/' + audio_file,
		});
	},

};
