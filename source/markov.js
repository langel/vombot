var fs = require('fs');
var _ = require('lodash');

var _file_target;
var map = {};
var word_no_prefix = ['.', ',', ';', '?', '!'];
var newline_token = '#~$EOL^%(';
var starter_words = [];


module.exports = {

	generate_string: function(length) {
		var word = starter_words[Math.floor(Math.random() * starter_words.length)];
		var string = word;
		var newline = false;
		while (!newline) {
			word = random_key(map[word]);
			if (word == newline_token) {
				newline = true;
			}
			else {
				if (!word_no_prefix.includes(word)) string += ' ';
				string += word;
			}
		}
		console.log('vombot says : ' + string);
		return string;
	},

	initialize: function(filename) {
		fs.readFile(filename, 'utf8', (err, data) => {
			data.split(/\r?\n/).forEach((line)=>{
				map_append(line);
			});
		});
		_file = filename;
	},

	log_chat: function(data) {
		if (data.startsWith('!')) return false;
		fs.writeFile(_file, data, { flag: 'a+'});
		map_append(data);
	},

	map_get: function() {
		return map;
	}

}

var random_key = function(obj) {
	var temp_key, keys = [];
	var obj_copy = JSON.parse(JSON.stringify(obj));
	for (temp_key in obj_copy) {
		if (obj.hasOwnProperty(temp_key)) {
			keys.push(temp_key);
		}
	}
	return keys[Math.floor(Math.random() * keys.length)];
}

var map_append = function(data) {
	console.log(process.memoryUsage());
	data = data.replace(/\r?\n/g, ' ' + newline_token + ' ');
	//var new_map = data.match(/[\w-']+|[^\w\s]+/g);
	var new_map = data.split(' ');
	// only process lines with more than one word
	if (new_map.length === 1) {
		return false;
	}
	//var new_map = data.split(/ /);
	var previous_word = '';
	new_map.forEach((word, index, new_map) => {
		if (index === 0 && !starter_words.includes(word)) starter_words.push(word);
		word_append(previous_word, word);
		previous_word = word;
		if (index === new_map.length - 1) {
			word_append(previous_word, newline_token);
		}
	});
};

var word_append = function(word, descendant) {
	if (typeof map[word] === "undefined") map[word] = {};
	map[word][descendant] = ++map[word][descendant] || 1;
};
