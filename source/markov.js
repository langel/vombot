var fs = require('fs');

var filename = 'markov_log.txt';
var file_id;
var map = {};


module.exports = {

	generate_string: function(length) {
		var map_copy = JSON.parse(JSON.stringify(map));
		var word = random_key(map);
		var string = word;
		for (var i=0; i<=length; i++) {
			map_copy = JSON.parse(JSON.stringify(map[word]));
			word = random_key(map_copy);
			string += ' ' + word;
		}
		return string;
	},

	init: function() {
		//file_id = fs.openSync(filename, 'a+');
		fs.readFile(filename, 'utf8', (err, data) => {
			map_append(data);
		});
	},

	log_chat: function(data) {
		fs.writeFile(filename, data, { flag: 'a+'});
		map_append(data);
	},

	map_get: function() {
		return map;
	}

}

var random_key = function(obj) {
	var temp_key, keys = [];
	for(temp_key in obj) {
		if(obj.hasOwnProperty(temp_key)) {
			keys.push(temp_key);
		}
	}
	return keys[Math.floor(Math.random() * keys.length)];
}

var map_append = function(data) {
	var new_map = data.match(/[\w-']+|[^\w\s]+/g);
	var previous_word = '';
	new_map.forEach((word) => {
		if (typeof map[previous_word] === "undefined") map[previous_word] = {};
		map[previous_word][word] = ++map[previous_word][word] || 1;
		previous_word = word;
	});
};
