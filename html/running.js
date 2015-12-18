var json, saw, conn;
var baseline_y = 200;
var saw_x = 333;
var max_spawn = 2;
var spawn_count = 0;

$.easing.easeInCubic = function(x, t, b, c, d) {
	return c*(t/=d)*t*t + b;
};


// establish websocket connection and kickstart running
$(function() {
	window.ws = window.WebSocket || window.MozWebSocket;
	conn = new ws('ws://192.168.1.125:1337');
	conn.onopen = function() {};
	conn.onerror = function() {
		$('body').append('AN ERROR OCCURRED');
	};
	conn.onmessage = function(message) {
		try {
			json = JSON.parse(message.data);
		}
		catch (e) {
			$('body').append('yer JSON is FUKT : ', message.data);
			return;
		}
		if (json.action == 'add') {
			$('body').append(json.data);
		}
		if (json.action == 'spawn_runner') {
			spawn_runner(json.data);
		}
	};
	saw = $('#blade').offset({left: saw_x, top: ~~(baseline_y - 20)});
	spawn_cycle();
	setInterval(function() {
		running_from_saw.check_for_collisions();
	}, 250);
});

function spawn_cycle() {
	spawn_runner('megaman');
	spawn_runner('contraman');
	if (spawn_count <= max_spawn) {
		setTimeout(spawn_cycle, 100);
		spawn_count++;
	}
}

function spawn_runner(name) {
	new_runner = Object.create(runner);
	Object.assign(new_runner, running_from_saw.runner_types[name]);
	new_runner.spawn(name);
}


var running_from_saw = {
	runner_count: 0,
	runners: Object.create(null),
	runner_types: {
		megaman: {
			name: 'megaman',
			x_offset: 50,
			dist_x: 120,
			dur_x: 600,
			dist_y: 10,
			dur_y: 10,
		},
		contraman: {
			name: 'contraman',
			dist_x: 150,
			dur_x: 250,
			dist_y: 12,
			dur_y: 30,
		},
	},
	update_runner_count: function() {
		this.runner_count = this.runners.length;
		conn.send(JSON.stringify(this));
	},
	check_for_collisions: function() {
		var check_list = jQuery.extend(true, {}, this.runners);
//		check_list['saw'] = {dom_obj: saw};
		$.each(this.runners, function(key, runner_check) {
			delete check_list[runner_check['id']];
			if (Object.keys(check_list).length) {
				//console.log(check_list);
				var runner_pos = runner_check.dom_obj.position();
				var runner_y = runner_check.dom_obj.css('z-index');
				//console.log(runner_check.id + ' ' + runner_pos.left + ' ' + runner_check.width + ', ' + runner_y);
				$.each(check_list, function(key, obstacle) {
					var obstacle_pos = obstacle.dom_obj.position();
					var obstacle_y = obstacle.dom_obj.css('z-index');
					//console.log(obstacle.id + ' ' + obstacle_pos.left + ' ' + obstacle.width + ', ' + obstacle_y);
					y_distance = Math.abs(runner_y - obstacle_y);
					if (runner_pos.left < obstacle_pos.left + obstacle.width &&
						runner_pos.left + runner_check.width > obstacle_pos.left &&
						y_distance < 4) {
						//runner_y < obstacle_y + obstacle.height &&
						//runner_y + runner_check.height > obstacle_y) {
						console.log('COLLIDE');
						runner_check.trip_and_die();
					}
				});
			}
		});
	},
}


var runner = {
	spawn: function(name) {
		var id = name + running_from_saw.runner_count;
		this.dom_obj = $("<img/>", {
			id: id, 
			src: name + '.gif', 
			class: 'runner',
		});
		this.id = id;
		var $this = this;
		this.dom_obj.on('load', function() {
			$('body').append($this.dom_obj.offset({top: -200}));
			var start_x = Math.random() * (saw.position().left - $this.dist_x);
			var start_x_offset = start_x + Math.random() * $this.dist_x;
			var fall_from_max_x = 250;
			var fall_from_x = start_x_offset + (Math.random() * fall_from_max_x - fall_from_max_x / 2);
			var start_y = baseline_y - $this.dom_obj.height() - ($this.dist_y / 2);
			var start_y_offset = start_y + Math.random() * $this.dist_y;
			// make sprites fall into screen
			$this.dom_obj.offset({top: -200, left: fall_from_x}).animate({top: start_y_offset, left: start_x_offset}, {duration: 1500, queue: false, easing: 'easeInCubic', complete: function() {
				$this.start_x = start_x;
				$this.start_y = start_y;
				$this.handle_x();
				$this.handle_y();
				$this.width = $this.dom_obj.width();
				$this.height = $this.dom_obj.height();
			}});
			running_from_saw.runners[id] = $this;
			running_from_saw.runner_count++;
			return $this;
		});
	},

	handle_x:  function() {
		var dest = this.start_x + Math.random() * this.dist_x;
		var dur = Math.random() * this.dur_x + dest * 100
		var $this = this;
		$this.dom_obj.animate({left: dest + "px"}, {duration: dur, queue: false, complete: function() {
			$this.handle_x();
		}});
	},

	handle_y: function() {
		var dist = this.start_y + Math.random() * this.dist_y;
		var dur = Math.random() * this.dur_y + dist * 10
		var $this = this;
		$this.dom_obj.animate({top: dist + "px"}, {duration: dur, queue: false, step: function() {
					$(this).css('zIndex', ~~($(this).position().top + $(this).height()));
				}, complete: function() {
				$this.handle_y();
			}
		});
	},

	trip_and_die: function() {
		var e = this.dom_obj;
		$({deg: 0}).animate({deg: -90}, {
			duration: 250,
			step: function(now) {
				e.css({'transform': 'rotate(' + now + 'deg)'});
			}
		});
		e.animate({left: "2500px"}, {duration: 1000, queue: false, easing: 'easeInCubic', complete: function() {
			$(this).remove();
			delete running_from_saw.runners[this.id];
			running_from_saw.update_runner_count();
		}});
	}
}

