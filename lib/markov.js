var fs = require('fs');
var _ = require('lodash');
var request = require('sync-request');

var newline_token = '#~$EOL^%(';
var word_no_prefix = ['.', ',', ';', '?', '!'];
//var markov_domain = 'http://54.187.237.105:44444/';
var markov_domain = 'http://0.0.0.0:44444/';


module.exports = {

	generate_string: function(seed = '') {
//		return false;
		let word;
		if (seed == '') {
			word = markov_call('random_seed');
			console.log(word);
		}
		else {
			var seed_words = seed.split(' ');
			seed_words.sort(function(a, b) { return b.length - a.length; });
			for (var i = 0; i < seed_words.length; i++) {
				let next = markov_call('word/' + seed_words[i]);
				if (word == '' && typeof next == 'object') word = seed_words[i];
			}
		}
		console.log('markov string started with : ' + word);
		var string = word;
		var newline = false;
		while (!newline) {
			let word_data = JSON.parse(markov_call('word/' + word)); 
			word = random_key(word_data);
			if (typeof word == 'undefined') return string;
			if (word == newline_token) {
				newline = true;
			}
			else {
				string += word + ' ';
			}
		}
		console.log('vombot says : ' + string);
		return string;
	},


	log_chat: function(data) {
		if (data.startsWith('!')) return false;
		// XXX send chat log to markov microservice
	},

}

var random_key = function(obj) {
	var keys = Object.keys(obj);
	return keys[ keys.length * Math.random() << 0];
}


let markov_call = function(command) {
	command = encodeURI(command);
	console.log('markov call : ' + command);
	return request('GET', markov_domain + command).getBody('utf8');
};

