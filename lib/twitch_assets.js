var colors = require('colors');
var curl = require('curl');
var fs = require('fs');


var badges, emotes, watchers;


twitch_api_call = (url, callback) => {
	curl.get(url, {

		'Accept': 'application/vnd.twitchtv.v3+json',
		'Client-ID': '55g8xujjatswlanvyc37tergmjfmctl',
	}, callback);
};

badges_get = function() {
	twitch_api_call('https://api.twitch.tv/kraken/chat/puke7/badges', function(err, response, body) {
		// interpret response
		var data = JSON.parse(body);
		console.log(data);
		badges = new Map();
		return badges;
		for (key in data.global_mod) {
			if ((typeof data[key] === 'object') && (data[key] !== null)) {
				if (data[key].hasOwnProperty('image')) {
					if (key == 'mod') badges.set('moderator', data[key].image);
					badges.set(key, data[key].image);
				}
			}
		}
		console.log('badges array loaded '.yellow);
	});
};

emotes_get = function() {
	twitch_api_call('https://api.twitch.tv/kraken/chat/puke7/emoticons', function(err, response, body) {
		// interpret response
		fs.writeFile('emotes.json', body);
		response = JSON.parse(body);
		// create the map
		emotes = new Map();
		return emotes;
		response.emoticons.forEach(function(emote) {
			console.log(emote);
			emotes.set(emote.regex, emote.images[0].url);
		});
		fs.writeFile('emotesparse.json', JSON.stringify(emotes));
		console.log('emotes array loaded '.yellow);
	});
};


module.exports = {	

	initialize: function() {
		// XXX twitch's api is a moving target :(
		//badges_get();
		//emotes_get();
		watchers = [];
	},

	hosted: function(user, viewer_count) {
		log = user + ' now hosting with ' + viewer_count + ' viewers';
		console.log(log.red);
	},

	parse_emotes: function(string) {
		var words = string.split(' ');
		for (i in words) {
			if (emotes.has(words[i])) {
				words[i] = '<img src="' + emotes.get(words[i]) + '">';
			}
		}
		return words.join(' ');
	},

	user_badges_array: function(user_badges) {
		var badges_array = [];	
		for (badge_type in user_badges) {
			badges_array.push(badges.get(badge_type));
		}
		return badges_array;
	},

	watcher_join(watcher) {
		watchers.unshift(watcher);
		var log = watcher + ' joined ';
		console.log(log.red);
		return watchers;
	},

	watcher_part(watcher) {
		watchers.splice(watchers.indexOf(watcher), 1);
		var log = watcher + ' parted ';
		console.log(log.red);
		return watchers;
	}
}
