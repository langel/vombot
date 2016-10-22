var colors = require('colors');
var curl = require('curl');


var badges, emotes, watchers;


badges_get = function() {
	curl.get('https://api.twitch.tv/kraken/chat/emotes/badges', {}, function(err, response, body) {
		// interpret response
		var data = JSON.parse(body);
		badges = new Map();
		for (key in data) {
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
	curl.get('https://api.twitch.tv/kraken/chat/emotes/emoticons', {}, function(err, response, body) {
		console.log(err);
		// interpret response
		response = JSON.parse(body);
		var data = response.emoticons;
		// create the map
		emotes = new Map();
		data.forEach(function(emote) {
			emotes.set(emote.regex, emote.url);
		});
		console.log('emotes array loaded '.yellow);
	});
};


module.exports = {	

	initialize: function() {
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
