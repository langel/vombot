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

	'!believe': function() {
		play_audio('believe.mp3');
	},

	'!biteme': function() {
		play_audio('biteme.mp3');
	},

	'!bowl': function() {
		play_audio('bowl.mp3');
	},

	'!california': function() {
		play_audio('california.mp3');
	},
	
	'!cowabunga': function() {
		play_audio('cowabunga.mp3');
	},
	
	'!daytona': function() {
		play_audio('daytona.mp3');
	},
	
	'!flipthefuck': function() {
		play_audio('flipthefuck.mp3');
	},
	
	'!fork': function() {
		play_audio('fork.mp3');
	},
	
	'!gameover': function() {
		play_audio('gameover.mp3');
	},
	
	'!goingon': function() {
		play_audio('goingon.mp3');
	},
	
	'!goofy': function() {
		play_audio('goofy.mp3');
	},
	
	'!iwon': function() {
		play_audio('iwon.mp3');
	},
	
	'!hero': function() {
		play_audio('hero.mp3');
	},
	
	'!laser': function() {
		play_audio('laser.mp3');
	},
	
	'!letsago': function() {
		play_audio('letsago.mp3');
	},
	
	'!lo': function() {
		play_audio('lo.mp3');
	},
	
	'!mattszon': function() {
		play_audio('mattszon.mp3');
	},
	
	'!mattzson': function() {
		play_audio('mattszon.mp3');
	},

	'!monster': function() {
		play_audio('zeldamonster.mp3');
	},
	
	'!myboy': function() {
		play_audio('myboy.mp3');
	},
	
	'!nuts': function() {
		play_audio('nuts.mp3');
	},
	
	'!ohno': function() {
		play_audio('ohno.mp3');
	},
	
	'!pace': function() {
		play_audio('wrp.mp3');
	},
	
	'!pizzaball': function() {
		play_audio('pizzaball.mp3');
	},

	'!princess': function(words) {
		var audio_file = princess_sounds[Math.floor(Math.random() * princess_sounds.length)];
		log = 'princess audio ' + audio_file + ' played';
		console.log(log.red);
		play_audio('peach/' + audio_file);
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

	'!xfiles': function() {
		play_audio('xfiles.mp3');
	},
	
	'!ydontu': function() {
		play_audio('ydontu.mp3');
	},
	
};
