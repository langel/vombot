var colors = require('colors');
var fs = require('fs');
var ws_server = require('./ws_server.js');



//  ASSET MEDIA HANDLER HERE
var available_runners = [];
var princess_sounds = [];

(function init_runner_data() {
	available_runners = fs.readdirSync('web/sprites/').filter(function(val) {
		return (val.indexOf('-running.gif') != -1);
	});
	console.log(available_runners);
})();

(function init_princess_audio() {
	princess_sounds = fs.readdirSync('web/audio/peach/').filter(function(val) {
		return (val.indexOf('.wav') != -1);
	});
	console.log(princess_sounds);
})();

var play_audio = function(soundfile) {
	ws_server.send({
		action: 'play_audio',
		data: soundfile,
	});
};

module.exports = {

	'!airhorn': function() {
		play_audio('airhorn.mp3');
	},

	'!california': function() {
		play_audio('california.mp3');
	},
	
	'!laser': function() {
		play_audio('laser.mp3');
	},

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
		play_audio('wrp.mp3');
	},

	'!princess': function(words) {
		var audio_file = princess_sounds[Math.floor(Math.random() * princess_sounds.length)];
		log = 'princess audio ' + audio_file + ' played';
		console.log(log.red);
		play_audio('peach/' + audio_file);
	},

	'!monster': function() {
		play_audio('zeldamonster.mp3');
	},
};
