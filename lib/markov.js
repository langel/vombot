var fs = require('fs');
var _ = require('lodash');
var request = require('sync-request');

var newline_token = '#~$EOL^%(';
var word_no_prefix = ['.', ',', ';', '?', '!'];
//var markov_domain = 'http://54.187.237.105:44444/';
var markov_domain = 'http://0.0.0.0:44444/';

// an array of words to not be heightened by the seed
let ignorables = ['a', 'about', 'an', 'and', 'at', 'but', 'e', 'for', 'from', 'get', 'i', 'in', 'is', 'more', 'not', 'o', 'of', 'ok', 'on', 'or', 'some', 'the', 'this', 'to', 'u', 'what', 'with', 'you'];

module.exports = {

	generate_string: function(seed = '') {
//		return false;
		let data = {};
		let word = '';
		if (seed == '') {
			word = markov_call('random_seed');
			console.log('starting with random word : ' + word);
		}
		else {
			var seed_words = get_seed_array(seed);
			seed_words.sort(function(a, b) { return b.length - a.length; });
			console.log('possible seed words : ' + JSON.stringify(seed_words));
			let words_by_options = {};
			for (var i = 0; i < seed_words.length; i++) {
				word = seed_words[i];
				if (!(word in words_by_options)) {
					let next = get_word_data(seed_words[i], data);
					if (next) words_by_options[word] = Object.keys(next).length;
				}
			}
			word = Object.keys(words_by_options).sort(function(a,b){return words_by_options[b]-words_by_options[a]})[0];
		}
		console.log('markov string started with : ' + word);
		var string = word;
		var newline = false;
		var word_counter = 0;
		while (!newline) {
			let word_data = get_word_data(word, data);
			word = word_by_weight(word, data, seed_words);
			if (typeof word == 'undefined') return string;
			if (word == newline_token) {
				newline = true;
			}
			else {
				string += ' ' + word;
			}
			word_counter++;
			if (word_counter > 37 || word == '') newline = true;
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

let get_seed_array = function(seed) {
	seed = seed.split(' ');
	_.uniq(seed, false);
	let index = seed.indexOf('');
	if (index !== -1) seed.splice(index, 1);
	return seed;
}

let get_word_data = function(word, data) {
	if (!data.hasOwnProperty(word)) {
		let word_data = JSON.parse(markov_call('word/' + word));
		if (typeof word_data == 'object') data[word] = word_data;
		else return false;
	}
	return data[word];
}

let markov_call = function(command) {
	command = encodeURI(command);
	console.log('markov call : ' + command);
	return request('GET', markov_domain + command).getBody('utf8');
};

let word_by_weight = function(word, data, seed_words = []) {
	let word_data = get_word_data(word, data);
	let option_count = Object.keys(word_data).length;
	console.log('word ' + word + ' has ' + option_count + ' options');
	if (option_count == 0) return false;
	if (seed_words.length > 0) {
		seed_words.forEach((seed_word) => {
			if (!ignorables.includes(seed_word) 
				&& word_data.hasOwnProperty(seed_word)) {
//				&& word_data[seed_word] < Object.keys(get_word_data(seed_word, data)).length / 8) {
				word_data[seed_word] *= 100;
				console.log(seed_word + ' :: ' + word_data[seed_word]);
			}
		});
	}
	let sorted_data = {};
	let value = 0;
	Object.keys(word_data).sort(function(a,b){return word_data[b]-word_data[a]}).forEach((word) => {
		sorted_data[value] = word;
		value += word_data[word];
	});
	let word_id = value * Math.random() << 0;
	console.log('value count: ' + value + ' && id picked: ' + word_id);
	for (const [value, key] of Object.entries(sorted_data)) {
		if (value <= word_id) word = key;
	}
	console.log(word);
	return word;
	console.log(JSON.stringify(word_data));
//	console.log(Object.keys(word_data).sort(function(a,b){return word_data[b]-word_data[a]}));
}
